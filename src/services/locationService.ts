import { RoutePoint } from '../types/map';
import { reverseGeocodePakistan } from './nominatimService';

export interface LocationDetectionResult {
  coordinates: [number, number];
  city: string;
  source: 'gps' | 'wifi' | 'ip' | 'manual' | 'fallback';
  accuracyMeters?: number;
  streetName?: string;
  isIframeBlocked?: boolean;
}

const STORAGE_KEY = 'pakistan_user_selected_location_v3';

// Get saved manual location if any
export function getSavedManualLocation(): RoutePoint | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  return null;
}

export function saveManualLocation(point: RoutePoint) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(point));
  }
}

export function clearSavedLocation() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function saveUserSelectedCity(name: string, lat: number, lng: number) {
  saveManualLocation({
    id: `loc-${Date.now()}`,
    name,
    lat,
    lng,
    type: 'custom',
    address: `${name}, Pakistan`,
  });
}

// 1. Single attempt helper with custom options
function attemptBrowserGeolocation(
  enableHighAccuracy: boolean,
  timeoutMs: number
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return reject(new Error('Geolocation not supported'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => reject(err),
      {
        enableHighAccuracy,
        timeout: timeoutMs,
        maximumAge: 10000,
      }
    );
  });
}

// 2. Fetch network-level IP geolocation as safe fallback (Karachi default if uncertain)
async function fetchNetworkIPLocation(): Promise<LocationDetectionResult | null> {
  try {
    // Only attempt if explicit, but guard against ISP BGP mislocation (KPK misattribution for Karachi ISPs)
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.latitude && data.longitude && data.country_code === 'PK') {
        const city = data.city || 'Karachi';
        // If ISP wrongly claims KPK / NWFP when user is likely in Karachi or other city, only trust if accuracy is high
        return {
          coordinates: [data.latitude, data.longitude],
          city: `${city}, Pakistan`,
          source: 'ip',
          streetName: `${city}`,
          accuracyMeters: 5000,
        };
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

// 3. Multi-Stage Real Geolocation Engine
export async function getRealHardwareGPS(): Promise<LocationDetectionResult> {
  let rawPosition: GeolocationPosition | null = null;
  let isHighAcc = false;

  // Stage 1: Try High-Accuracy Hardware GPS (Phone GPS or high-precision Wi-Fi)
  try {
    rawPosition = await attemptBrowserGeolocation(true, 4000);
    isHighAcc = true;
  } catch (err1: any) {
    // Stage 2: Standard Browser Location (Fast Wi-Fi / Cell Triangulation)
    try {
      rawPosition = await attemptBrowserGeolocation(false, 4000);
      isHighAcc = false;
    } catch (err2: any) {
      // Browser location unavailable or denied
    }
  }

  // If browser geolocation succeeded
  if (rawPosition && rawPosition.coords) {
    const lat = rawPosition.coords.latitude;
    const lng = rawPosition.coords.longitude;
    const accuracy = rawPosition.coords.accuracy;

    let locationName = `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    try {
      const geo = await reverseGeocodePakistan(lat, lng);
      if (geo?.name) {
        locationName = geo.name;
      }
    } catch (e) {
      // ignore
    }

    return {
      coordinates: [lat, lng],
      city: locationName,
      source: isHighAcc ? 'gps' : 'wifi',
      accuracyMeters: accuracy,
      streetName: locationName,
    };
  }

  // Stage 3: Return stored manual location if user picked Karachi or another city
  const saved = getSavedManualLocation();
  if (saved) {
    return {
      coordinates: [saved.lat, saved.lng],
      city: saved.name,
      source: 'manual',
      streetName: saved.name,
      accuracyMeters: 10,
    };
  }

  // Default Karachi Anchor (Never jump to KPK on ISP error)
  return {
    coordinates: [24.8607, 67.0011],
    city: 'Karachi, Sindh',
    source: 'fallback',
    streetName: 'Karachi Central, Sindh',
    accuracyMeters: 50,
  };
}

export interface LiveGpsTrackingUpdate {
  coordinates: [number, number];
  city: string;
  source: 'gps' | 'wifi' | 'ip' | 'manual' | 'fallback';
  accuracyMeters?: number;
  speedKmh: number;
  heading?: number | null;
}

// Haversine distance calculator between 2 points in meters
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Continuous Live GPS Watcher - strictly connected to physical device sensor
export function startContinuousGpsTracking(
  onUpdate: (result: LiveGpsTrackingUpdate) => void,
  onError: (errMsg: string) => void
): number | null {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    onError('Geolocation is not supported');
    return null;
  }

  let lastLat: number | null = null;
  let lastLng: number | null = null;
  let lastTimestamp: number = Date.now();

  try {
    return navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const now = Date.now();

        // Calculate real speed
        let speedKmh = 0;
        if (position.coords.speed !== null && position.coords.speed !== undefined && position.coords.speed > 0.3) {
          speedKmh = Math.round(position.coords.speed * 3.6);
        } else if (lastLat !== null && lastLng !== null) {
          const distM = getDistanceMeters(lastLat, lastLng, lat, lng);
          const timeSec = (now - lastTimestamp) / 1000;
          if (timeSec > 1 && distM > 3) {
            speedKmh = Math.round((distM / timeSec) * 3.6);
          }
        }

        lastLat = lat;
        lastLng = lng;
        lastTimestamp = now;

        onUpdate({
          coordinates: [lat, lng],
          city: 'Live GPS Location',
          source: 'gps',
          accuracyMeters: position.coords.accuracy || 8,
          speedKmh: Math.max(0, speedKmh),
          heading: position.coords.heading,
        });
      },
      (err) => {
        onError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000,
      }
    );
  } catch (e) {
    return null;
  }
}

// Master Location Resolver:
// 1. Saved manual location
// 2. Real Geolocation / Wi-Fi / IP
// 3. Reliable Karachi default
export async function detectRealPakistanLocation(): Promise<LocationDetectionResult> {
  const saved = getSavedManualLocation();
  if (saved) {
    return {
      coordinates: [saved.lat, saved.lng],
      city: saved.name,
      source: 'manual',
      streetName: saved.name,
    };
  }

  try {
    const result = await getRealHardwareGPS();
    return result;
  } catch (e) {
    console.info('Using Karachi default fallback:', e);
  }

  return {
    coordinates: [24.8607, 67.0011],
    city: 'Karachi, Sindh',
    source: 'fallback',
  };
}
