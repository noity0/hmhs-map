export type MapProvider = 
  | 'osm-streets'      // OpenStreetMap HD Streets & Gullies
  | 'carto-voyager'    // Google Maps-like Clean Aesthetic (Free)
  | 'esri-satellite'   // High-Resolution Satellite & Aerial
  | 'osm-topo'         // Topographic Mountain Relief
  | 'carto-dark'       // Night / Dark Navigation Mode
  | 'humanitarian';    // High-contrast pedestrian & alleys

export type TravelMode = 'driving' | 'motorcycle' | 'walking' | 'transit';

export type RouteOptimizationPreference = 
  | 'best_route_ever'     // ✨ Best Route Ever: Most Greenery, Amazing Scenic Views, 99%+ Safe & High Speed
  | 'fastest_time'        // ⚡ Fastest Route: High-Speed Expressway & Direct Arterial
  | 'shortest_distance'   // 📏 Nearest Route: Minimum Kilometers Direct
  | 'ai_smart';

export interface VehicleProfile {
  id: string;
  name: string;
  urduName?: string;
  category: 'car' | 'motorcycle' | 'truck' | 'rickshaw' | 'suv' | 'bus' | 'bicycle' | 'van' | 'pickup' | 'emergency' | 'scooter' | 'ev' | 'custom';
  maxSpeedKmh: number;
  citySpeedKmh: number;
  highwaySpeedKmh: number;
  widthMeters: number; // For clearance
  weightTons?: number;
  icon: string;
  avoidNarrowGullies: boolean;
  motorwayAllowed: boolean;
  notes?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RoutePoint {
  id: string;
  name: string;
  urduName?: string;
  lat: number;
  lng: number;
  type?: 'city' | 'landmark' | 'gully' | 'bazaar' | 'interchange' | 'hospital' | 'custom';
  address?: string;
  city?: string;
  province?: string;
}

export interface RouteSegment {
  distanceMeters: number;
  durationSeconds: number;
  instruction: string;
  instructionUrdu?: string;
  maneuver: 'straight' | 'turn-left' | 'turn-right' | 'slight-left' | 'slight-right' | 'u-turn' | 'roundabout' | 'merge' | 'destination';
  coordinates: [number, number][]; // [lat, lng]
  roadName: string;
  roadType?: 'motorway' | 'trunk' | 'primary' | 'secondary' | 'residential' | 'link';
  safetyWarning?: string;
}

export interface RouteSafetyMetrics {
  safetyScore: number; // 0 - 100
  safetyTier: 'ultra_safe' | 'safe' | 'caution' | 'restricted';
  isDividedCarriageway: boolean;
  hasStreetLighting: boolean;
  narrowRoadRisk: 'none' | 'low' | 'moderate' | 'high';
  vehicleFitVerified: boolean;
  safetyHighlights: string[];
  safetyWarnings: string[];
}

export interface LearnedRouteMemory {
  id: string;
  originKey: string;
  destinationKey: string;
  originName: string;
  destinationName: string;
  routeType: RouteOptimizationPreference;
  distanceKm: number;
  avgDurationMin: number;
  tripCount: number;
  successScore: number; // 0 - 100
  safetyRating: number; // 0 - 100
  corridorName: string;
  lastNavigated: string;
  notes: string;
  polyline: [number, number][];
}

export interface CalculatedRoute {
  id: string;
  summary: string;
  distanceKm: number;
  durationMin: number;
  travelMode: TravelMode;
  vehicleProfile?: VehicleProfile;
  routeType?: RouteOptimizationPreference;
  trafficStatus: 'low' | 'moderate' | 'heavy' | 'jammed';
  trafficDelayMin: number;
  segments: RouteSegment[];
  fullPolyline: [number, number][]; // [lat, lng][]
  origin: RoutePoint;
  destination: RoutePoint;
  tolls?: string[];
  isOffline?: boolean;
  aiAnalysis?: string;
  shortcutTips?: string[];
  alternativeRoutes?: CalculatedRoute[];
  timeSavedMin?: number;
  aiConfidence?: number;
  aiVerifiedCorridor?: string;
  // Route Learning & Safety additions
  safetyMetrics?: RouteSafetyMetrics;
  isLearnedRoute?: boolean;
  learnedTripCount?: number;
  corridorBadge?: string;
}

export interface OfflinePack {
  id: string;
  name: string;
  urduName?: string;
  region: string;
  sizeMb: number;
  bounds: [[number, number], [number, number]]; // [southWest, northEast]
  center: [number, number]; // [lat, lng]
  zoomRange: [number, number];
  isDownloaded: boolean;
  downloadProgress: number;
  tileCount: number;
  routesCount: number;
  description: string;
  lastUpdated?: string;
}

export interface TrafficIncident {
  id: string;
  title: string;
  urduTitle?: string;
  urduName?: string;
  city: string;
  locationName: string;
  coordinates: [number, number];
  severity: 'low' | 'medium' | 'high' | 'blocked';
  type: 'congestion' | 'construction' | 'accident' | 'naka' | 'rain_water' | 'protest';
  description: string;
  reportedAt: string;
  verifiedCount: number;
}

export interface POI {
  id: string;
  name: string;
  urduName?: string;
  category: 'hospital' | 'petrol' | 'mosque' | 'food' | 'landmark' | 'toll' | 'mechanic' | 'police';
  lat: number;
  lng: number;
  address: string;
  city: string;
  rating?: number;
  openNow?: boolean;
  phone?: string;
  gullyDetail?: string;
}
