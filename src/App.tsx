import React, { useState, useEffect, useRef } from 'react';
import { 
  RoutePoint, 
  CalculatedRoute, 
  TravelMode, 
  TrafficIncident, 
  POI, 
  MapProvider, 
  VehicleProfile 
} from './types/map';
import { 
  PAKISTAN_CENTER, 
  MAJOR_CITIES, 
  FAMOUS_GULLIES_AND_STREETS, 
  INITIAL_TRAFFIC_INCIDENTS, 
  PAKISTAN_POIS 
} from './data/pakistanLocations';
import { KARACHI_AREAS } from './data/karachiAreas';
import { calculatePakistanRoute } from './services/routingService';
import { OfflineStorageManager } from './services/offlineStorage';
import { reverseGeocodePakistan } from './services/nominatimService';
import { 
  detectRealPakistanLocation, 
  getRealHardwareGPS,
  saveUserSelectedCity,
  saveManualLocation,
  getSavedManualLocation,
  startContinuousGpsTracking,
  getDistanceMeters
} from './services/locationService';
import { OfflineLeafletMap } from './components/OfflineLeafletMap';
import { RouteSearchPanel } from './components/RouteSearchPanel';
import { NavigationBanner } from './components/NavigationBanner';
import { POICategoriesBar } from './components/POICategoriesBar';
import { LocationInspectorCard } from './components/LocationInspectorCard';
import { KarachiTownSelectorModal } from './components/KarachiTownSelectorModal';
import { TrafficIncidentsModal } from './components/TrafficIncidentsModal';
import { SetCurrentLocationModal } from './components/SetCurrentLocationModal';
import { VehicleSelectorModal } from './components/VehicleSelectorModal';
import { LearnedRoutesModal } from './components/LearnedRoutesModal';
import { SeoIndexingModal } from './components/SeoIndexingModal';
import { RouteCompletionModal } from './components/RouteCompletionModal';
import { ReadOnlyShareModal } from './components/ReadOnlyShareModal';
import { CityQuickBar } from './components/CityQuickBar';
import { WorldRegion } from './data/worldwideLocations';

import { 
  Layers, 
  Flame, 
  LocateFixed, 
  PhoneCall, 
  ShieldAlert, 
  Globe2, 
  ZoomIn, 
  X, 
  Compass, 
  MapPin, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Building2,
  Navigation,
  Radio,
  Menu,
  SlidersHorizontal,
  ChevronDown,
  Brain,
  ShieldCheck,
  Globe,
  Zap,
  Ruler,
  Gauge,
  Trash2
} from 'lucide-react';
import { speechService } from './services/speechService';

export default function App() {
  // Map State (Zoom range from Whole World at zoom 1 to 25m street level at zoom 21)
  const [mapProvider, setMapProvider] = useState<MapProvider>('carto-voyager');
  const [center, setCenter] = useState<[number, number]>([24.8607, 67.0011]); // Default Karachi Center
  const [zoom, setZoom] = useState<number>(15);
  const [showTraffic, setShowTraffic] = useState<boolean>(false); // Default false: clean map, no random lines
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Routing & Points State
  const [origin, setOrigin] = useState<RoutePoint | null>(null);
  const [destination, setDestination] = useState<RoutePoint | null>(null);
  const [inspectedLocation, setInspectedLocation] = useState<RoutePoint | null>(null);
  const [isDirectionsMode, setIsDirectionsMode] = useState<boolean>(false);
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const [calculatedRoute, setCalculatedRoute] = useState<CalculatedRoute | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Distance Tape Measure Tool State
  const [isMeasuringDistance, setIsMeasuringDistance] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  // Live GPS Navigation & Speed State (Strictly linked to physical sensor, no fake timer movement)
  const [isNavigating, setIsNavigating] = useState<number>(0); // 0 = not navigating, 1 = active, 2 = paused
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [liveGpsSpeed, setLiveGpsSpeed] = useState<number>(0);
  const [liveHeading, setLiveHeading] = useState<number | null>(null);

  // Simulation Mode & Route Completion
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(2);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState<boolean>(false);
  const [completedRoute, setCompletedRoute] = useState<CalculatedRoute | null>(null);
  const simPolyIndexRef = useRef<number>(0);

  // Sync refs for live GPS tracking without stale state closures
  const calculatedRouteRef = useRef<CalculatedRoute | null>(null);
  const isNavigatingRef = useRef<number>(0);
  const currentStepIndexRef = useRef<number>(0);

  useEffect(() => {
    calculatedRouteRef.current = calculatedRoute;
  }, [calculatedRoute]);

  useEffect(() => {
    isNavigatingRef.current = isNavigating;
  }, [isNavigating]);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  // Incidents & POIs
  const [incidents, setIncidents] = useState<TrafficIncident[]>(INITIAL_TRAFFIC_INCIDENTS);
  const [pois, setPois] = useState<POI[]>(PAKISTAN_POIS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showExploreBar, setShowExploreBar] = useState<boolean>(false);

  // Real GPS & Location State
  const [userLocation, setUserLocation] = useState<[number, number] | null>([24.8607, 67.0011]);
  const [userLocationName, setUserLocationName] = useState<string>('Karachi, Sindh');
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isPinpointMode, setIsPinpointMode] = useState<boolean>(false);
  const [locationToast, setLocationToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals & Menu Dropdowns
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleProfile | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState<boolean>(false);
  const [isSetLocationModalOpen, setIsSetLocationModalOpen] = useState<boolean>(false);
  const [isKarachiModalOpen, setIsKarachiModalOpen] = useState<boolean>(false);
  const [isTrafficModalOpen, setIsTrafficModalOpen] = useState<boolean>(false);
  const [isLayersDropdownOpen, setIsLayersDropdownOpen] = useState<boolean>(false);
  const [isEmergencyBannerOpen, setIsEmergencyBannerOpen] = useState<boolean>(false);
  const [isLearnedRoutesModalOpen, setIsLearnedRoutesModalOpen] = useState<boolean>(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);
  const [isReadOnlyModalOpen, setIsReadOnlyModalOpen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);

  // Show status notification
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setLocationToast({ message, type });
    setTimeout(() => setLocationToast(null), 3500);
  };

  // Priority 1: On App Mount - Attempt Location acquisition & default Origin to Live Location
  useEffect(() => {
    let watchId: number | null = null;

    const initPriorityLocation = async () => {
      const manual = getSavedManualLocation();
      let initPt: RoutePoint | null = null;

      if (manual) {
        setCenter([manual.lat, manual.lng]);
        setUserLocation([manual.lat, manual.lng]);
        setUserLocationName(manual.name);
        setIsGpsActive(false);
        initPt = manual;
      }

      try {
        const gpsRes = await getRealHardwareGPS();
        setCenter(gpsRes.coordinates);
        setUserLocation(gpsRes.coordinates);
        setUserLocationName(gpsRes.streetName || gpsRes.city);
        setIsGpsActive(gpsRes.source === 'gps');
        setGpsAccuracy(gpsRes.accuracyMeters || 15);
        setZoom(17);

        initPt = {
          id: 'real-gps-start',
          name: gpsRes.streetName || gpsRes.city || 'My Live Location',
          lat: gpsRes.coordinates[0],
          lng: gpsRes.coordinates[1],
          type: 'custom',
        };
      } catch (gpsErr) {
        console.info('Initial location ready with default:', gpsErr);
      }

      if (!origin && initPt) {
        setOrigin(initPt);
      }

      // Continuous Live Hardware GPS Watcher
      watchId = startContinuousGpsTracking(
        (update) => {
          setUserLocation(update.coordinates);
          setIsGpsActive(true);
          setGpsAccuracy(update.accuracyMeters || 8);
          setLiveGpsSpeed(update.speedKmh || 0);
          setLiveHeading(update.heading ?? null);

          // Real physical step progression along route
          if (calculatedRouteRef.current && isNavigatingRef.current === 1) {
            const route = calculatedRouteRef.current;
            const destLat = route.destination.lat;
            const destLng = route.destination.lng;
            const distToDest = getDistanceMeters(update.coordinates[0], update.coordinates[1], destLat, destLng);

            if (distToDest <= 35) {
              setIsNavigating(0);
              setIsSimulating(false);
              setCompletedRoute(route);
              setIsCompletionModalOpen(true);
              showToast('🎉 Destination reached!', 'success');
              return;
            }

            const curSeg = route.segments[currentStepIndexRef.current];
            if (curSeg && curSeg.coordinates && curSeg.coordinates.length > 0) {
              const stepEnd = curSeg.coordinates[curSeg.coordinates.length - 1];
              const distToStepEnd = getDistanceMeters(
                update.coordinates[0],
                update.coordinates[1],
                stepEnd[0],
                stepEnd[1]
              );
              // Advance step when user approaches the turn
              if (distToStepEnd <= 40 && currentStepIndexRef.current < route.segments.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
              }
            }
          }
        },
        () => {}
      );
    };

    initPriorityLocation();

    return () => {
      if (watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Route Simulation Drive Engine (Smoothly traverses polyline to test & complete routes)
  useEffect(() => {
    if (!isSimulating || !calculatedRoute || calculatedRoute.fullPolyline.length === 0) {
      return;
    }

    const intervalMs = Math.max(80, Math.round(500 / simSpeed));
    const polyline = calculatedRoute.fullPolyline;

    const timer = setInterval(() => {
      simPolyIndexRef.current += 1;
      const curIdx = simPolyIndexRef.current;

      if (curIdx >= polyline.length) {
        // Route complete
        clearInterval(timer);
        setIsSimulating(false);
        setIsNavigating(0);
        setCompletedRoute(calculatedRoute);
        setIsCompletionModalOpen(true);
        showToast(`🎉 Arrived at ${calculatedRoute.destination.name}!`, 'success');
        return;
      }

      const coord = polyline[curIdx];
      setUserLocation(coord);
      setCenter(coord);
      setLiveGpsSpeed(Math.round(45 + Math.random() * 15));

      // Check distance to destination
      const destDist = getDistanceMeters(coord[0], coord[1], calculatedRoute.destination.lat, calculatedRoute.destination.lng);
      if (destDist <= 30) {
        clearInterval(timer);
        setIsSimulating(false);
        setIsNavigating(0);
        setCompletedRoute(calculatedRoute);
        setIsCompletionModalOpen(true);
        showToast(`🎉 Destination Reached!`, 'success');
        return;
      }

      // Check step progression
      const currentStep = calculatedRoute.segments[currentStepIndexRef.current];
      if (currentStep && currentStep.coordinates && currentStep.coordinates.length > 0) {
        const stepEnd = currentStep.coordinates[currentStep.coordinates.length - 1];
        const distToStepEnd = getDistanceMeters(coord[0], coord[1], stepEnd[0], stepEnd[1]);
        if (distToStepEnd <= 40 && currentStepIndexRef.current < calculatedRoute.segments.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, simSpeed, calculatedRoute]);

  // Route calculation triggered ONLY when both origin and destination exist
  useEffect(() => {
    if (origin && destination && isDirectionsMode) {
      handleCalculateRoute(origin, destination, travelMode);
    } else {
      setCalculatedRoute(null);
    }
  }, [origin, destination, travelMode, isDirectionsMode, isOfflineMode, selectedVehicle]);

  const handleCalculateRoute = async (start: RoutePoint, end: RoutePoint, mode: TravelMode) => {
    setIsCalculating(true);
    try {
      const route = await calculatePakistanRoute(start, end, mode, isOfflineMode, 'fastest_time', selectedVehicle || undefined);
      setCalculatedRoute(route);
      const fastest = route.alternativeRoutes?.find(r => r.routeType === 'fastest_time') || route;
      const timeSaved = route.timeSavedMin || 4;
      const vLabel = selectedVehicle ? ` for ${selectedVehicle.name}` : '';
      showToast(`⚡ HMHS Map: Fastest Route${vLabel} (${fastest.durationMin} min • ${fastest.distanceKm} km, ~${timeSaved}m faster)`, 'success');
    } catch (e) {
      console.error('Routing failed:', e);
      showToast('Could not calculate route. Please try another destination.', 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSwapPoints = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleClearRoute = () => {
    setOrigin(null);
    setDestination(null);
    setCalculatedRoute(null);
    setInspectedLocation(null);
    setIsDirectionsMode(false);
    showToast('Route cleared. Clean map view.', 'info');
  };

  // Turn-by-Turn GPS Navigation Start
  const handleStartNavigation = () => {
    if (!calculatedRoute) return;
    setIsNavigating(1);
    setIsSimulating(false);
    setCurrentStepIndex(0);
    simPolyIndexRef.current = 0;

    if (userLocation) {
      setCenter([userLocation[0], userLocation[1]]);
    } else {
      setCenter([calculatedRoute.fullPolyline[0][0], calculatedRoute.fullPolyline[0][1]]);
    }
    setZoom(18);
    showToast('📍 Live Navigation Active — Ready to Guide', 'success');
  };

  const handleStopNavigation = () => {
    setIsNavigating(0);
    setIsSimulating(false);
    setCurrentStepIndex(0);
    simPolyIndexRef.current = 0;
    if (calculatedRoute) {
      setCenter([calculatedRoute.origin.lat, calculatedRoute.origin.lng]);
      setZoom(15);
    }
  };

  const handleTogglePause = () => {
    if (isSimulating) {
      setIsSimulating(false);
      return;
    }
    setIsNavigating(prev => (prev === 1 ? 2 : 1));
  };

  const handleToggleSimulation = () => {
    if (!calculatedRoute) return;
    if (isSimulating) {
      setIsSimulating(false);
      showToast('Simulation paused', 'info');
    } else {
      setIsNavigating(1);
      setIsSimulating(true);
      if (simPolyIndexRef.current >= calculatedRoute.fullPolyline.length - 1) {
        simPolyIndexRef.current = 0;
        setCurrentStepIndex(0);
      }
      showToast(`🚗 Auto-Drive Simulation Active (${simSpeed}x)`, 'success');
    }
  };

  const handleCompleteRoute = () => {
    if (!calculatedRoute) return;
    setIsSimulating(false);
    setIsNavigating(0);
    setCompletedRoute(calculatedRoute);
    setIsCompletionModalOpen(true);
    showToast(`🎉 Arrived at ${calculatedRoute.destination.name}!`, 'success');
  };

  // Real Hardware GPS Direct Request
  const handleLocateMe = async () => {
    showToast('Acquiring real location...', 'info');
    try {
      const gpsResult = await getRealHardwareGPS();
      setCenter(gpsResult.coordinates);
      setUserLocation(gpsResult.coordinates);
      setUserLocationName(gpsResult.streetName || gpsResult.city);
      setIsGpsActive(gpsResult.source === 'gps');
      setGpsAccuracy(gpsResult.accuracyMeters || 10);
      setZoom(18); // 25-meter view
      showToast(`📍 Location: ${gpsResult.streetName || gpsResult.city}`, 'success');
    } catch (gpsError: any) {
      setIsSetLocationModalOpen(true);
    }
  };

  // 1-Tap Use Current Real Location as Starting Point
  const handleUseCurrentGpsAsOrigin = async () => {
    try {
      showToast('Setting start point...', 'info');
      const gps = await getRealHardwareGPS();
      const gpsOrigin: RoutePoint = {
        id: 'real-gps-start',
        name: gps.streetName || 'My Real Location',
        lat: gps.coordinates[0],
        lng: gps.coordinates[1],
        type: 'custom',
        address: `Live Location (${gps.streetName || ''})`,
      };
      setOrigin(gpsOrigin);
      setUserLocation(gps.coordinates);
      setUserLocationName(gpsOrigin.name);
      setIsGpsActive(gps.source === 'gps');
      setCenter(gps.coordinates);
      setZoom(18);
      setIsDirectionsMode(true);
      showToast(`Start set to ${gpsOrigin.name}`, 'success');
    } catch (e: any) {
      if (userLocation) {
        setOrigin({
          id: 'user-loc',
          name: userLocationName || 'My Location',
          lat: userLocation[0],
          lng: userLocation[1],
          type: 'custom',
        });
        setIsDirectionsMode(true);
      } else {
        setIsSetLocationModalOpen(true);
      }
    }
  };

  // Set Location from Modal (Manual or GPS)
  const handleLocationSelectedFromModal = (point: RoutePoint, isGps: boolean) => {
    setCenter([point.lat, point.lng]);
    setUserLocation([point.lat, point.lng]);
    setUserLocationName(point.name);
    setIsGpsActive(isGps);
    setZoom(18);
    saveManualLocation(point);
    showToast(`Location set to: ${point.name}`, 'success');
  };

  // Map Click Handler (Supports Distance Measuring, normal inspect or Pinpoint Current Location Mode)
  const handleMapClick = async (lat: number, lng: number) => {
    if (isMeasuringDistance) {
      setMeasurePoints(prev => [...prev, [lat, lng]]);
      return;
    }

    if (isPinpointMode) {
      const geoInfo = await reverseGeocodePakistan(lat, lng);
      const placeName = geoInfo?.name || `Custom Spot (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

      const manualPoint: RoutePoint = {
        id: `manual-pin-${Date.now()}`,
        name: placeName,
        lat,
        lng,
        type: 'custom',
        address: geoInfo?.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      };

      setUserLocation([lat, lng]);
      setUserLocationName(placeName);
      setIsGpsActive(false);
      setIsPinpointMode(false);
      saveManualLocation(manualPoint);
      showToast(`📍 Location set to: ${placeName}`, 'success');
      return;
    }

    // Standard Map Inspection
    const geoInfo = await reverseGeocodePakistan(lat, lng);
    const placeName = geoInfo?.name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    const clickedPoint: RoutePoint = {
      id: `inspect-${Date.now()}`,
      name: placeName,
      lat,
      lng,
      type: 'custom',
      address: geoInfo?.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    };

    setInspectedLocation(clickedPoint);
  };

  // Set Inspected Point as Destination
  const handleSetInspectedAsDestination = (point: RoutePoint) => {
    setDestination(point);
    setIsDirectionsMode(true);
    if (!origin) {
      if (userLocation) {
        setOrigin({
          id: 'user-gps',
          name: userLocationName || 'My Location',
          lat: userLocation[0],
          lng: userLocation[1],
          type: 'custom',
        });
      } else {
        const defaultStart = KARACHI_AREAS[0];
        setOrigin(defaultStart);
      }
    }
    showToast(`Destination: ${point.name}`, 'success');
  };

  // Set Inspected Point as Origin
  const handleSetInspectedAsOrigin = (point: RoutePoint) => {
    setOrigin(point);
    setIsDirectionsMode(true);
    showToast(`Start: ${point.name}`, 'success');
  };

  // Jump to specific city or Karachi area
  const handleSelectCityOrArea = (point: RoutePoint) => {
    setCenter([point.lat, point.lng]);
    setZoom(point.type === 'gully' || point.type === 'bazaar' ? 18 : 15);
    setInspectedLocation(point);
  };

  // Select Search Result
  const handleSelectSearchResult = (loc: RoutePoint) => {
    setCenter([loc.lat, loc.lng]);
    setZoom(18);
    setInspectedLocation(loc);
  };

  // Quick Preset Zoom Range Helpers (Whole World vs 25-meter view)
  const handleZoomToWholeWorld = () => {
    setCenter([25.0, 45.0]);
    setZoom(2);
  };

  const handleZoomTo25Meters = () => {
    setZoom(20);
  };

  const handleSelectPackArea = (pack: { center: [number, number]; name: string }) => {
    setCenter(pack.center);
    setZoom(15);
  };

  const handleAddIncident = (newInc: TrafficIncident) => {
    setIncidents(prev => [newInc, ...prev]);
    setCenter(newInc.coordinates);
    setZoom(16);
  };

  const handleFocusIncident = (inc: TrafficIncident) => {
    setCenter(inc.coordinates);
    setZoom(17);
  };

  const handleSelectPOI = (poi: POI) => {
    const poiPoint: RoutePoint = {
      id: poi.id,
      name: poi.name,
      urduName: poi.urduName,
      lat: poi.lat,
      lng: poi.lng,
      address: poi.address,
      city: poi.city,
      type: poi.category === 'landmark' ? 'gully' : 'city',
    };
    setCenter([poi.lat, poi.lng]);
    setZoom(18);
    setInspectedLocation(poiPoint);
  };

  const handleSelectLearnedCorridor = (origPt: RoutePoint, destPt: RoutePoint) => {
    setOrigin(origPt);
    setDestination(destPt);
    setIsDirectionsMode(true);
    setCenter([origPt.lat, origPt.lng]);
    setZoom(14);
    showToast(`Loaded Safe Learned Corridor: ${origPt.name} → ${destPt.name}`, 'success');
  };

  const handleSelectRegion = (region: WorldRegion) => {
    setCenter(region.center);
    setZoom(region.zoom);
    showToast(`🌍 Flying to ${region.name}`, 'info');
  };

  return (
    <div id="pakistan-maps-app" className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans select-none">
      {/* 1. MAP CANVAS (Clean Leaflet with zero fake lines) */}
      <div className="absolute inset-0 z-0">
        <OfflineLeafletMap
          center={center}
          zoom={zoom}
          provider={mapProvider}
          showTraffic={showTraffic}
          origin={origin}
          destination={destination}
          inspectedLocation={inspectedLocation}
          calculatedRoute={calculatedRoute}
          incidents={incidents}
          pois={pois}
          selectedCategory={selectedCategory}
          isNavigating={isNavigating}
          currentStepIndex={currentStepIndex}
          userGpsLocation={userLocation}
          onMapClick={handleMapClick}
          onSelectPOI={handleSelectPOI}
          onSelectIncident={handleFocusIncident}
          onSelectRouteAlternative={setCalculatedRoute}
        />
      </div>

      {/* 2. PINPOINT CURRENT LOCATION ACTIVE BANNER */}
      {isPinpointMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-2xl border border-blue-400 flex items-center gap-3 animate-bounce text-xs">
          <MapPin className="w-4 h-4 animate-pulse" />
          <span>Tap anywhere on the map to set your location</span>
          <button
            onClick={() => setIsPinpointMode(false)}
            className="px-2 py-0.5 bg-blue-800 hover:bg-blue-900 rounded-lg text-xs font-bold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 3. TOP TURN-BY-TURN NAVIGATION HUD */}
      {isNavigating > 0 && calculatedRoute && (
        <NavigationBanner
          route={calculatedRoute}
          currentStepIndex={currentStepIndex}
          isNavigating={isNavigating}
          onStopNavigation={handleStopNavigation}
          onTogglePause={handleTogglePause}
          onStepChange={setCurrentStepIndex}
          onCompleteRoute={handleCompleteRoute}
          onToggleSimulation={handleToggleSimulation}
          isSimulating={isSimulating}
          simSpeed={simSpeed}
          onChangeSimSpeed={setSimSpeed}
          speedKmh={liveGpsSpeed}
        />
      )}

      {/* 4. TOP FLOATING SEARCH BAR & WORLD EXPLORER (Responsive for Phone & Desktop) */}
      {isNavigating === 0 && (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-30 flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-start justify-between gap-2 w-full">
            {/* Top Search & Directions Card (Takes prominent top position) */}
            <div className="pointer-events-auto flex-1 max-w-xl min-w-0">
              <RouteSearchPanel
                origin={origin}
                destination={destination}
                travelMode={travelMode}
                selectedVehicle={selectedVehicle}
                calculatedRoute={calculatedRoute}
                isCalculating={isCalculating}
                userLocationName={userLocationName}
                isGpsActive={isGpsActive}
                onSetOrigin={setOrigin}
                onSetDestination={setDestination}
                onClearRoute={handleClearRoute}
                onSwapPoints={handleSwapPoints}
                onChangeTravelMode={setTravelMode}
                onStartNavigation={handleStartNavigation}
                onSaveRouteOffline={route => OfflineStorageManager.getInstance().saveRouteOffline(route)}
                isOfflineMode={isOfflineMode}
                isDirectionsMode={isDirectionsMode}
                onToggleDirectionsMode={() => setIsDirectionsMode(!isDirectionsMode)}
                onSelectSearchResult={handleSelectSearchResult}
                onUseCurrentGpsAsOrigin={handleUseCurrentGpsAsOrigin}
                onSelectRouteAlternative={setCalculatedRoute}
                onOpenSetLocationModal={() => setIsSetLocationModalOpen(true)}
                onOpenKarachiModal={() => setIsKarachiModalOpen(true)}
                onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
                onOpenLearnedRoutesModal={() => setIsLearnedRoutesModalOpen(true)}
              />
            </div>

            {/* Top Right: Map Layers & Menu Icons */}
            <div className="flex items-center gap-1.5 pointer-events-auto relative flex-shrink-0">
              {/* Map Layer Switcher */}
              <div className="relative">
                <button
                  id="header-layers-toggle-btn"
                  onClick={() => {
                    setIsLayersDropdownOpen(!isLayersDropdownOpen);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-10 h-10 rounded-2xl bg-neutral-900/95 hover:bg-neutral-800 text-white border border-neutral-800 shadow-xl backdrop-blur-md flex items-center justify-center transition-colors"
                  title="Change Map Style (Satellite, Streets, Dark)"
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                </button>

                {isLayersDropdownOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-50 text-xs">
                    <span className="text-[10px] font-bold text-neutral-400 px-2.5 py-1 uppercase tracking-wider">Map Style</span>
                    <button
                      onClick={() => { setMapProvider('carto-voyager'); setIsLayersDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        mapProvider === 'carto-voyager' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <span>Clean Streets</span>
                    </button>
                    <button
                      onClick={() => { setMapProvider('osm-streets'); setIsLayersDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        mapProvider === 'osm-streets' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <span>HD Streets & Gullies</span>
                    </button>
                    <button
                      onClick={() => { setMapProvider('esri-satellite'); setIsLayersDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        mapProvider === 'esri-satellite' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <span>Satellite View</span>
                    </button>
                    <button
                      onClick={() => { setMapProvider('carto-dark'); setIsLayersDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        mapProvider === 'carto-dark' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <span>Night Dark Mode</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Clean 3-Dot More Tools Menu */}
              <div className="relative">
                <button
                  id="more-options-menu-btn"
                  onClick={() => {
                    setIsMoreMenuOpen(!isMoreMenuOpen);
                    setIsLayersDropdownOpen(false);
                  }}
                  className="w-10 h-10 rounded-2xl bg-neutral-900/95 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 shadow-xl backdrop-blur-md flex items-center justify-center transition-colors"
                  title="Tools & Features"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute right-0 top-12 w-60 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-50 text-xs">
                    <button
                      onClick={() => {
                        setIsMeasuringDistance(!isMeasuringDistance);
                        setMeasurePoints([]);
                        setIsMoreMenuOpen(false);
                        showToast(isMeasuringDistance ? 'Distance measure turned off' : 'Tap points on map to measure distance', 'info');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                        isMeasuringDistance ? 'bg-blue-600 text-white font-bold' : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <Ruler className="w-4 h-4 text-blue-400" />
                      <span>Measure Map Distance</span>
                    </button>

                    <button
                      id="btn-open-readonly-link-modal"
                      onClick={() => { setIsReadOnlyModalOpen(true); setIsMoreMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 bg-blue-950/70 hover:bg-blue-900/80 border border-blue-500/40 text-blue-300 font-black transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>🔒 Read-Only Live Link</span>
                    </button>

                    <button
                      onClick={() => { setIsLearnedRoutesModalOpen(true); setIsMoreMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-neutral-800 text-emerald-300 font-bold transition-colors"
                    >
                      <Brain className="w-4 h-4 text-emerald-400" />
                      <span>Learned Road Knowledge Base</span>
                    </button>

                    <button
                      id="btn-open-seo-indexing-modal"
                      onClick={() => { setIsSeoModalOpen(true); setIsMoreMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-black transition-colors"
                    >
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>⚡ 1-Click Google & SEO Index</span>
                    </button>

                    <button
                      onClick={() => { setIsKarachiModalOpen(true); setIsMoreMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-neutral-800 text-neutral-200 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>Karachi Areas & Towns</span>
                    </button>

                    <button
                      onClick={() => { setShowExploreBar(!showExploreBar); setIsMoreMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-neutral-800 text-neutral-200 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Explore Places Nearby</span>
                    </button>

                    <button
                      onClick={() => { setShowTraffic(!showTraffic); setIsMoreMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                        showTraffic ? 'bg-orange-600/30 text-orange-400 font-bold' : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>Traffic Incidents ({incidents.length})</span>
                    </button>

                    <button
                      onClick={() => { setIsEmergencyBannerOpen(true); setIsMoreMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-neutral-800 text-red-400 transition-colors"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Emergency SOS 130</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Worldwide & Pakistan Place Quick Jump Bar */}
          <div className="w-full max-w-4xl">
            <CityQuickBar
              currentCenter={center}
              onSelectCity={handleSelectCityOrArea}
              onOpenKarachiTownModal={() => setIsKarachiModalOpen(true)}
              onSelectRegion={handleSelectRegion}
            />
          </div>
        </div>
      )}

      {/* 5. COLLAPSIBLE EXPLORE PLACES BAR */}
      {showExploreBar && isNavigating === 0 && (
        <div className="absolute top-20 left-2 sm:left-3 right-2 sm:right-3 z-20 max-w-2xl mx-auto pointer-events-auto animate-in fade-in slide-in-from-top-2">
          <POICategoriesBar
            selectedCategory={selectedCategory}
            onSelectCategory={cat => {
              setSelectedCategory(cat);
              if (!cat || cat === 'all') setShowExploreBar(false);
            }}
            onSelectPOI={handleSelectPOI}
            pois={pois}
            isOfflineMode={isOfflineMode}
          />
        </div>
      )}

      {/* 6. TOAST STATUS NOTIFICATION */}
      {locationToast && (
        <div
          id="location-status-toast"
          className={`absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 px-3 sm:px-4 py-2 rounded-xl backdrop-blur-xl shadow-2xl border text-xs font-bold flex items-center gap-2 pointer-events-auto max-w-[90vw] animate-in fade-in slide-in-from-top-2 ${
            locationToast.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/60'
              : locationToast.type === 'error'
              ? 'bg-red-950/95 text-red-300 border-red-500/60'
              : 'bg-neutral-900/95 text-neutral-200 border-neutral-700'
          }`}
        >
          {locationToast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
          {locationToast.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
          {locationToast.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
          <span className="truncate">{locationToast.message}</span>
        </div>
      )}

      {/* 7. LOCATION INSPECTOR CARD */}
      {inspectedLocation && isNavigating === 0 && !isPinpointMode && (
        <div className="absolute top-20 sm:top-24 right-2 sm:right-4 left-2 sm:left-auto z-30 max-w-sm w-auto sm:w-full">
          <LocationInspectorCard
            location={inspectedLocation}
            onClose={() => setInspectedLocation(null)}
            onSetAsDestination={handleSetInspectedAsDestination}
            onSetAsOrigin={handleSetInspectedAsOrigin}
          />
        </div>
      )}

      {/* 8. EMERGENCY SOS BANNER */}
      {isEmergencyBannerOpen && (
        <div className="absolute top-20 sm:top-24 right-2 sm:right-4 left-2 sm:left-auto z-30 max-w-sm sm:w-80 bg-neutral-900/95 backdrop-blur-xl border border-red-600/50 rounded-2xl shadow-2xl p-4 text-xs flex flex-col gap-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-sm">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Pakistan Helplines
            </h4>
            <button onClick={() => setIsEmergencyBannerOpen(false)} className="text-neutral-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <a href="tel:130" className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-red-500">
              <div>
                <strong className="text-white block">Motorway Police (NHMP)</strong>
                <span className="text-[10px] text-neutral-400">Emergency 130</span>
              </div>
              <span className="font-mono font-black text-red-400 text-sm px-2 py-1 bg-red-950/40 rounded">130</span>
            </a>
            <a href="tel:1122" className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-red-500">
              <div>
                <strong className="text-white block">Rescue 1122</strong>
                <span className="text-[10px] text-neutral-400">Ambulance</span>
              </div>
              <span className="font-mono font-black text-red-400 text-sm px-2 py-1 bg-red-950/40 rounded">1122</span>
            </a>
          </div>
        </div>
      )}

      {/* 9. DISTANCE MEASURE FLOATING BADGE (Bottom Center) */}
      {isMeasuringDistance && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-neutral-900/95 border border-blue-500/60 rounded-2xl shadow-2xl px-4 py-2.5 backdrop-blur-xl flex items-center gap-3 text-xs font-bold pointer-events-auto">
          <div className="flex items-center gap-1.5 text-blue-400">
            <Ruler className="w-4 h-4" />
            <span>Distance:</span>
            <span className="text-white font-mono font-black text-sm">
              {measurePoints.reduce((sum, pt, idx) => {
                if (idx === 0) return 0;
                const prev = measurePoints[idx - 1];
                return sum + getDistanceMeters(prev[0], prev[1], pt[0], pt[1]);
              }, 0) >= 1000
                ? `${(measurePoints.reduce((sum, pt, idx) => {
                    if (idx === 0) return 0;
                    const prev = measurePoints[idx - 1];
                    return sum + getDistanceMeters(prev[0], prev[1], pt[0], pt[1]);
                  }, 0) / 1000).toFixed(2)} km`
                : `${Math.round(measurePoints.reduce((sum, pt, idx) => {
                    if (idx === 0) return 0;
                    const prev = measurePoints[idx - 1];
                    return sum + getDistanceMeters(prev[0], prev[1], pt[0], pt[1]);
                  }, 0))} m`}
            </span>
          </div>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-400 text-[11px]">{measurePoints.length} points</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMeasurePoints([])}
              className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
              title="Clear Points"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsMeasuringDistance(false);
                setMeasurePoints([]);
              }}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] rounded-lg font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 10. GOOGLE MAPS SPEEDOMETER & ULTRA LIVE TELEMETRY (Bottom Left) */}
      <div className="absolute bottom-6 left-3 z-20 pointer-events-auto flex items-center gap-2 flex-wrap">
        <div className="bg-neutral-900/90 border border-neutral-800/90 backdrop-blur-md rounded-2xl px-3 py-2 shadow-xl flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
            <Gauge className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Speed</span>
            <span className="text-xs font-black text-white font-mono">{liveGpsSpeed} <span className="text-[10px] text-neutral-400 font-normal">km/h</span></span>
          </div>
        </div>

        {/* Ultra Live Coordinates & Zoom HUD */}
        <div className="hidden sm:flex bg-neutral-900/90 border border-neutral-800/90 backdrop-blur-md rounded-2xl px-3 py-2 shadow-xl items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider">Live Coordinates</span>
            <span className="text-[11px] font-mono font-bold text-neutral-200">
              {center[0].toFixed(4)}° {center[0] >= 0 ? 'N' : 'S'}, {center[1].toFixed(4)}° {center[1] >= 0 ? 'E' : 'W'}
            </span>
          </div>
          <span className="text-neutral-700">|</span>
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-400 font-black uppercase tracking-wider">Zoom Level</span>
            <span className="text-[11px] font-mono font-bold text-emerald-400">
              {zoom}x {zoom >= 18 ? '(Street/Gully)' : zoom >= 12 ? '(City)' : zoom >= 5 ? '(Country)' : '(Global)'}
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-red-600 rounded-xl w-10 h-10 shadow-xl flex flex-col items-center justify-center text-neutral-900 font-black leading-none">
          <span className="text-[9px] uppercase font-bold text-neutral-600">Limit</span>
          <span className="text-xs">60</span>
        </div>
      </div>

      {/* 11. FLOATING MAP CONTROLS (Bottom Right) */}
      <div className="absolute bottom-6 right-3 sm:right-4 z-20 flex flex-col gap-2.5 pointer-events-auto">
        {/* Reset Compass North */}
        <button
          onClick={() => {
            setZoom(16);
            showToast('Compass reset North', 'info');
          }}
          className="w-11 h-11 rounded-2xl bg-neutral-900/95 hover:bg-neutral-800 active:scale-95 text-neutral-200 border border-neutral-800 shadow-xl backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
          title="Reset Map Orientation"
        >
          <Compass className="w-5 h-5 text-emerald-400" />
        </button>

        {/* Measure Distance Tool Toggle Button */}
        <button
          onClick={() => {
            setIsMeasuringDistance(!isMeasuringDistance);
            setMeasurePoints([]);
            showToast(isMeasuringDistance ? 'Distance measure turned off' : 'Tap points on map to measure distance', 'info');
          }}
          className={`w-11 h-11 rounded-2xl border shadow-xl backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
            isMeasuringDistance
              ? 'bg-blue-600 border-blue-400 text-white'
              : 'bg-neutral-900/95 hover:bg-neutral-800 text-neutral-200 border-neutral-800'
          }`}
          title="Measure Map Distance"
        >
          <Ruler className="w-5 h-5 text-blue-400" />
        </button>

        {/* Real Hardware GPS Button (High contrast, 48px touch target for Android) */}
        <button
          id="locate-me-gps-btn"
          onClick={handleLocateMe}
          className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white border border-blue-400 shadow-2xl flex items-center justify-center transition-all cursor-pointer"
          title="Center on my Live GPS Location"
        >
          <LocateFixed className="w-5 h-5" />
        </button>
      </div>

      {/* 10. MODALS */}
      <SetCurrentLocationModal
        isOpen={isSetLocationModalOpen}
        onClose={() => setIsSetLocationModalOpen(false)}
        currentLocationName={userLocationName}
        currentCoordinates={userLocation}
        onLocationSelected={handleLocationSelectedFromModal}
        onEnableMapPinpointMode={() => setIsPinpointMode(true)}
      />

      <KarachiTownSelectorModal
        isOpen={isKarachiModalOpen}
        onClose={() => setIsKarachiModalOpen(false)}
        onSelectLocation={handleSelectCityOrArea}
      />

      <TrafficIncidentsModal
        isOpen={isTrafficModalOpen}
        onClose={() => setIsTrafficModalOpen(false)}
        incidents={incidents}
        onAddIncident={handleAddIncident}
        onFocusIncident={handleFocusIncident}
      />

      <VehicleSelectorModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        selectedVehicle={selectedVehicle}
        onSelectVehicle={(v) => {
          setSelectedVehicle(v);
          setIsVehicleModalOpen(false);
          if (v) {
            showToast(`Selected Vehicle: ${v.name} (${v.maxSpeedKmh} km/h)`, 'success');
          } else {
            showToast('Cleared vehicle profile (Standard mode)', 'info');
          }
        }}
      />

      <LearnedRoutesModal
        isOpen={isLearnedRoutesModalOpen}
        onClose={() => setIsLearnedRoutesModalOpen(false)}
        onSelectLearnedCorridor={handleSelectLearnedCorridor}
      />

      <SeoIndexingModal
        isOpen={isSeoModalOpen}
        onClose={() => setIsSeoModalOpen(false)}
      />

      <ReadOnlyShareModal
        isOpen={isReadOnlyModalOpen}
        onClose={() => setIsReadOnlyModalOpen(false)}
      />

      {/* Route Completion & Arrival Modal */}
      {isCompletionModalOpen && completedRoute && (
        <RouteCompletionModal
          route={completedRoute}
          onClose={() => setIsCompletionModalOpen(false)}
          onNewRoute={() => {
            setIsCompletionModalOpen(false);
            handleClearRoute();
          }}
        />
      )}
    </div>
  );
}
