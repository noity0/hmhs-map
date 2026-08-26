import { RoutePoint } from '../types/map';

// Universal Geocoding Engine (Server Proxy + Photon + Nominatim)
export async function searchPakistanLocations(query: string): Promise<RoutePoint[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();
  const encodedQuery = encodeURIComponent(cleanQuery);

  // 1. First try server-side proxy `/api/geocode` (aggregates Photon, Nominatim, Open-Meteo with no CORS limits)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`/api/geocode?q=${encodedQuery}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (err) {
    // Fall back to direct browser fetch
  }

  // 2. Browser Direct Fallback: Photon API (Fast, handles towns, sectors, streets, works globally)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodedQuery}&limit=20`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(photonUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.features)) {
        return data.features.map((feat: any) => {
          const props = feat.properties || {};
          const coords = feat.geometry?.coordinates || [67.0011, 24.8607];
          const name = props.name || props.street || props.district || props.city || cleanQuery;
          const city = props.city || props.district || props.county || props.state || props.country || '';
          const province = props.state || props.country || '';
          const addressParts = [props.name, props.street, props.district, props.city, props.state, props.country].filter(Boolean);

          return {
            id: `photon-${props.osm_id || Math.random()}`,
            name,
            lat: coords[1],
            lng: coords[0],
            type: props.osm_value === 'residential' || props.osm_value === 'service' ? 'gully' : 'city',
            address: addressParts.join(', ') || name,
            city: city || 'Global',
            province: province || 'Earth',
          } as RoutePoint;
        });
      }
    }
  } catch (err) {
    // Fall through to Nominatim
  }

  // 3. Browser Direct Fallback: Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=20`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en,ur',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return data.map((item: any) => {
        const address = item.address || {};
        const road = address.road || address.pedestrian || address.neighbourhood || address.suburb || item.name;
        const city = address.city || address.town || address.village || address.state_district || address.state || address.country || '';
        const province = address.state || address.country || '';

        return {
          id: `osm-${item.place_id || Math.random()}`,
          name: item.name || road || item.display_name.split(',')[0],
          urduName: address['name:ur'] || undefined,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type === 'residential' || item.type === 'service' ? 'gully' : 'city',
          address: item.display_name,
          city: city || 'Global',
          province: province || 'Earth',
        } as RoutePoint;
      });
    }
  } catch (err) {
    console.info('Live geocoding fallback unavailable:', err);
  }

  return [];
}

// Universal Reverse Geocoding: Look up street / city / landmark anywhere on Earth
export async function reverseGeocodePakistan(lat: number, lng: number): Promise<{ name: string; address: string; gullyDetail?: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en,ur',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const streetOrGully = addr.road || addr.pedestrian || addr.footway || addr.path || addr.neighbourhood || addr.suburb || addr.city || addr.town || addr.country || 'Location Pin';

      return {
        name: streetOrGully,
        address: data.display_name,
        gullyDetail: addr.neighbourhood || addr.suburb || addr.city || addr.country,
      };
    }
  } catch (e) {
    console.info('Reverse geocoding unavailable:', e);
  }

  return null;
}
