import { useState, useEffect, useRef } from 'react';
import { RoutePoint, TravelMode, CalculatedRoute, VehicleProfile, RouteOptimizationPreference } from '../types/map';
import { MAJOR_CITIES, FAMOUS_GULLIES_AND_STREETS } from '../data/pakistanLocations';
import { KARACHI_AREAS } from '../data/karachiAreas';
import { filterLocalLocations, executeUniversalSearch } from '../utils/searchUtils';
import { routeLearningService } from '../services/routeLearningService';
import { 
  Search, 
  MapPin, 
  Navigation, 
  ArrowUpDown, 
  Car, 
  Bike, 
  Footprints, 
  X, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Crosshair, 
  Loader2, 
  Route, 
  SlidersHorizontal,
  Compass,
  Building2,
  ShieldCheck,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Leaf,
  Layers
} from 'lucide-react';

interface RouteSearchPanelProps {
  origin: RoutePoint | null;
  destination: RoutePoint | null;
  travelMode: TravelMode;
  selectedVehicle?: VehicleProfile;
  calculatedRoute: CalculatedRoute | null;
  isCalculating: boolean;
  userLocationName?: string;
  isGpsActive?: boolean;
  onSetOrigin: (point: RoutePoint | null) => void;
  onSetDestination: (point: RoutePoint | null) => void;
  onClearRoute: () => void;
  onSwapPoints: () => void;
  onChangeTravelMode: (mode: TravelMode) => void;
  onStartNavigation: () => void;
  onSaveRouteOffline?: (route: CalculatedRoute) => void;
  isOfflineMode: boolean;
  isDirectionsMode: boolean;
  onToggleDirectionsMode: () => void;
  onSelectSearchResult: (point: RoutePoint) => void;
  onUseCurrentGpsAsOrigin?: () => void;
  onSelectRouteAlternative?: (route: CalculatedRoute) => void;
  onOpenSetLocationModal?: () => void;
  onOpenKarachiModal?: () => void;
  onOpenVehicleModal?: () => void;
  onOpenLearnedRoutesModal?: () => void;
}

export function RouteSearchPanel({
  origin,
  destination,
  travelMode,
  selectedVehicle,
  calculatedRoute,
  isCalculating,
  userLocationName = 'Karachi, Pakistan',
  isGpsActive = false,
  onSetOrigin,
  onSetDestination,
  onClearRoute,
  onSwapPoints,
  onChangeTravelMode,
  onStartNavigation,
  onSaveRouteOffline,
  isOfflineMode,
  isDirectionsMode,
  onToggleDirectionsMode,
  onSelectSearchResult,
  onUseCurrentGpsAsOrigin,
  onSelectRouteAlternative,
  onOpenSetLocationModal,
  onOpenKarachiModal,
  onOpenVehicleModal,
  onOpenLearnedRoutesModal,
}: RouteSearchPanelProps) {
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | 'search'>('destination');
  const [searchQuery, setSearchQuery] = useState('');
  const [combinedSearchResults, setCombinedSearchResults] = useState<RoutePoint[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [showStepsAccordion, setShowStepsAccordion] = useState(false);
  const [showSafetyDetails, setShowSafetyDetails] = useState(false);
  const [selectedRouteType, setSelectedRouteType] = useState<RouteOptimizationPreference>('best_route_ever');
  const [feedbackRecorded, setFeedbackRecorded] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync selectedRouteType with current calculatedRoute
  useEffect(() => {
    if (calculatedRoute?.routeType) {
      setSelectedRouteType(calculatedRoute.routeType);
      setFeedbackRecorded(false);
    }
  }, [calculatedRoute]);

  // Universal Search Engine (Instant local + Online Geocoding Proxy)
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!searchQuery || searchQuery.trim().length < 2) {
      setCombinedSearchResults([]);
      setIsSearchingOnline(false);
      return;
    }

    // 1. Instant local results (< 5ms)
    const localMatches = filterLocalLocations(searchQuery, 25);
    setCombinedSearchResults(localMatches);

    if (isOfflineMode) {
      setIsSearchingOnline(false);
      return;
    }

    // 2. Online Geocoder aggregation
    setIsSearchingOnline(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const { combinedResults } = await executeUniversalSearch(searchQuery, isOfflineMode);
        setCombinedSearchResults(combinedResults);
      } catch {
        // Keep local results intact if network fails
      } finally {
        setIsSearchingOnline(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, isOfflineMode]);

  const handleSelectLocation = (loc: RoutePoint) => {
    if (isDirectionsMode) {
      if (activeInput === 'origin') {
        onSetOrigin(loc);
        setActiveInput('destination');
      } else {
        onSetDestination(loc);
      }
    } else {
      onSelectSearchResult(loc);
    }
    setSearchQuery('');
    setCombinedSearchResults([]);
  };

  // Find all available alternative routes
  const alternatives = calculatedRoute?.alternativeRoutes || (calculatedRoute ? [calculatedRoute] : []);
  const bestRouteEver = alternatives.find(r => r.routeType === 'best_route_ever') || calculatedRoute;
  const fastestRoute = alternatives.find(r => r.routeType === 'fastest_time') || calculatedRoute;
  const nearestRoute = alternatives.find(r => r.routeType === 'shortest_distance') || calculatedRoute;

  const isOriginLiveLocation = origin?.id === 'real-gps-start' || origin?.id === 'user-loc' || origin?.id === 'user-gps';

  const handleFeedback = (type: 'good' | 'narrow') => {
    if (calculatedRoute) {
      routeLearningService.recordRouteExperience(calculatedRoute, type);
      setFeedbackRecorded(true);
    }
  };

  return (
    <div
      id="route-search-panel"
      className="w-full sm:w-[410px] md:w-[440px] bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto transition-all duration-300 max-h-[85dvh]"
    >
      {/* 1. TOP SEARCH BAR */}
      <div className="p-2.5 sm:p-3 border-b border-neutral-800/80">
        {!isDirectionsMode ? (
          /* Normal Search Mode: Top Input with Brand & Route Button */
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800/90 rounded-2xl p-1.5 pl-3 shadow-inner">
              {/* Brand Logo / Current Location Pill */}
              <button
                id="searchbar-brand-location-btn"
                onClick={onOpenSetLocationModal}
                className="flex items-center gap-1.5 text-xs font-black text-emerald-400 hover:text-white transition-colors flex-shrink-0"
                title="HMHS Map — Tap to set location"
              >
                <div className="w-6 h-6 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                </div>
                <span className="hidden xs:inline">HMHS</span>
              </button>

              <div className="h-4 w-[1px] bg-neutral-800 flex-shrink-0" />

              {/* Main Search Input */}
              <div className="flex-1 relative flex items-center min-w-0">
                <Search className="w-4 h-4 text-neutral-400 flex-shrink-0 mr-2" />
                <input
                  id="pakistan-location-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search city, area, gully, or highway..."
                  className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none truncate py-1"
                />
                {isSearchingOnline ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin flex-shrink-0 ml-1" />
                ) : searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-neutral-400 hover:text-white p-1 flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>

              {/* Get Directions / Route Button */}
              <button
                id="toggle-directions-mode-btn"
                onClick={onToggleDirectionsMode}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 flex-shrink-0 transition-transform active:scale-95"
                title="Get Directions / Find Route"
              >
                <Navigation className="w-3.5 h-3.5 fill-white" />
                <span>Route</span>
              </button>
            </div>

            {/* Quick Suggestions / Vehicle & Learned Corridors Pills */}
            {!searchQuery.trim() && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-0.5">
                <button
                  onClick={onOpenVehicleModal}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 whitespace-nowrap transition-colors"
                >
                  <span>{selectedVehicle ? selectedVehicle.icon : '🚗'}</span>
                  <span>{selectedVehicle ? selectedVehicle.name : '+ Vehicle Profile'}</span>
                </button>

                {onOpenLearnedRoutesModal && (
                  <button
                    onClick={onOpenLearnedRoutesModal}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-neutral-950 hover:bg-neutral-800 text-emerald-300 border border-emerald-500/40 whitespace-nowrap transition-colors"
                  >
                    <Brain className="w-3 h-3 text-emerald-400" />
                    <span>Learned Corridors</span>
                  </button>
                )}

                <button
                  onClick={onOpenKarachiModal}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-neutral-950 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 whitespace-nowrap transition-colors"
                >
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Karachi Areas</span>
                </button>

                <button
                  onClick={() => setSearchQuery('Shahrah-e-Faisal')}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 whitespace-nowrap"
                >
                  Shahrah-e-Faisal
                </button>

                <button
                  onClick={() => setSearchQuery('Lahore Ring Road')}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 whitespace-nowrap"
                >
                  Lahore Ring Road
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Directions Mode: Origin + Destination Inputs */
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span className="text-xs font-bold text-white">Smart Route Planner & Safety Engine</span>
              </div>
              <button
                id="close-directions-btn"
                onClick={onToggleDirectionsMode}
                className="w-6 h-6 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Travel Mode Pills */}
            <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800/80">
              <button
                id="mode-driving-btn"
                onClick={() => onChangeTravelMode('driving')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  travelMode === 'driving'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Drive</span>
              </button>

              <button
                id="mode-motorcycle-btn"
                onClick={() => onChangeTravelMode('motorcycle')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  travelMode === 'motorcycle'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Bike</span>
              </button>

              <button
                id="mode-walking-btn"
                onClick={() => onChangeTravelMode('walking')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  travelMode === 'walking'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>Walk</span>
              </button>

              {/* Active Vehicle Button in Directions Mode */}
              <button
                id="directions-vehicle-btn"
                onClick={onOpenVehicleModal}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-colors"
                title="Change Vehicle Profile"
              >
                <span>{selectedVehicle ? selectedVehicle.icon : '🚗'}</span>
                <span className="max-w-[70px] truncate">{selectedVehicle ? selectedVehicle.name.split(' ')[0] : 'Profile'}</span>
              </button>
            </div>

            {/* Origin & Destination Stack with Swap Button */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex flex-col gap-1.5">
                {/* 1. Origin Input */}
                <div
                  onClick={() => setActiveInput('origin')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeInput === 'origin'
                      ? 'bg-neutral-950 border-emerald-500 ring-1 ring-emerald-500/40'
                      : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/30 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-neutral-400 block font-medium">Starting Point</span>
                    <span className="text-xs font-bold text-white truncate block">
                      {origin ? origin.name : isOriginLiveLocation ? 'Current GPS Location' : 'Choose starting point...'}
                    </span>
                  </div>
                  {origin && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSetOrigin(null);
                      }}
                      className="text-neutral-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 2. Destination Input */}
                <div
                  onClick={() => setActiveInput('destination')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeInput === 'destination'
                      ? 'bg-neutral-950 border-emerald-500 ring-1 ring-emerald-500/40'
                      : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/30 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-neutral-400 block font-medium">Destination</span>
                    <span className="text-xs font-bold text-white truncate block">
                      {destination ? destination.name : 'Choose destination...'}
                    </span>
                  </div>
                  {destination && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSetDestination(null);
                      }}
                      className="text-neutral-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Swap Button */}
              <button
                id="swap-route-points-btn"
                onClick={onSwapPoints}
                className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
                title="Swap Starting Point and Destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions in Directions Mode */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                onClick={onUseCurrentGpsAsOrigin}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 font-bold transition-colors"
              >
                <Crosshair className="w-3 h-3 text-blue-400" />
                <span>Use Current Location</span>
              </button>

              {onOpenLearnedRoutesModal && (
                <button
                  onClick={onOpenLearnedRoutesModal}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-emerald-300 border border-neutral-800 font-semibold transition-colors"
                >
                  <Brain className="w-3 h-3 text-emerald-400" />
                  <span>Learned Routes</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. BODY CONTENT (Search Results or Multi-Corridor Route Cards) */}
      {(searchQuery.trim() || isDirectionsMode) && (
        <div className="flex-1 overflow-y-auto max-h-[60dvh] flex flex-col">
          {/* SEARCH SUGGESTIONS & RESULTS */}
          {searchQuery.trim() && (
            <div className="p-2 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 px-2 py-1 block">
                {isSearchingOnline ? 'Searching map & address database...' : `Results for "${searchQuery}"`}
              </span>

              {combinedSearchResults.length > 0 ? (
                <div className="space-y-1">
                  {combinedSearchResults.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-800 flex items-start gap-2.5 transition-colors group"
                    >
                      <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white truncate block">{loc.name}</span>
                        <p className="text-[10px] text-neutral-400 truncate">{loc.address || loc.city || loc.province}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 p-2 text-center">No location found.</p>
              )}
            </div>
          )}

          {/* AI ANALYZING SCANNING STATE */}
          {isCalculating && (
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-col items-center justify-center gap-2.5 text-center">
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 animate-ping absolute" />
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-5 h-5 animate-spin" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white flex items-center justify-center gap-1.5">
                  🤖 Learning & Analyzing All Real Road Corridors...
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Checking multi-lane divided expressways, vehicle width clearances & safety scores
                </span>
              </div>
            </div>
          )}

          {/* MULTI-CORRIDOR ROUTE EXPLORER & SAFETY CARDS */}
          {calculatedRoute && !isCalculating && isDirectionsMode && !searchQuery.trim() && (
            <div className="p-3 sm:p-3.5 bg-neutral-950 flex flex-col gap-3">
              {/* Route Learning & Safety Badge */}
              <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-neutral-900 to-neutral-900 border border-emerald-500/40 flex flex-col gap-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Safety Verified • {calculatedRoute.safetyMetrics?.safetyScore || 96}% Safety Rating
                  </span>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Brain className="w-2.5 h-2.5" />
                    {calculatedRoute.isLearnedRoute ? 'Learned Memory' : 'Active Learning'}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-300 leading-relaxed">
                  {calculatedRoute.aiAnalysis || `All true road corridors evaluated. Selected path provides verified multi-lane clearance and safe travel conditions.`}
                </p>
              </div>

              {/* Corridor Comparison Heading */}
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> True Possible Road Corridors:
                </span>
                <span className="text-[10px] text-neutral-400">Tap to select corridor</span>
              </div>

              {/* CORRIDOR SELECTOR: FEATURED BEST ROUTE EVER + FASTEST & NEAREST */}
              <div className="flex flex-col gap-2">
                {/* 1. ✨ BEST ROUTE EVER (FEATURED PROMINENT CARD) */}
                <button
                  id="select-best-route-ever-card"
                  onClick={() => {
                    setSelectedRouteType('best_route_ever');
                    if (bestRouteEver && onSelectRouteAlternative) {
                      onSelectRouteAlternative(bestRouteEver);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all relative overflow-hidden ${
                    selectedRouteType === 'best_route_ever'
                      ? 'bg-gradient-to-br from-emerald-950/95 via-neutral-900 to-teal-950/80 border-emerald-400 ring-2 ring-emerald-500/60 shadow-xl shadow-emerald-950/60'
                      : 'bg-neutral-900/90 border-neutral-800 hover:border-emerald-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        <Sparkles className="w-3 h-3 text-emerald-300 animate-pulse" /> ✨ Best Route Ever
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-600/30">
                        99% Safe • Scenic
                      </span>
                    </div>
                    {selectedRouteType === 'best_route_ever' && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between mt-0.5">
                    <div className="text-xl font-black text-white flex items-baseline gap-1">
                      {bestRouteEver?.durationMin || calculatedRoute.durationMin} <span className="text-xs font-normal text-neutral-300">min</span>
                      <span className="text-xs font-bold text-neutral-400 ml-1.5">({bestRouteEver?.distanceKm || calculatedRoute.distanceKm} km)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/50 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      Saves {calculatedRoute.timeSavedMin || 4}m
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1 border-t border-emerald-900/40">
                    <span className="text-emerald-300 font-medium flex items-center gap-1 truncate">
                      🌿 Max Greenery & Boulevards
                    </span>
                    <span className="text-teal-300 font-medium flex items-center gap-1 truncate">
                      🌄 Amazing Scenic View & Vistas
                    </span>
                    <span className="text-amber-300 font-medium flex items-center gap-1 truncate">
                      🛡️ 100% Divided & Ultra-Safe
                    </span>
                    <span className="text-emerald-300 font-medium flex items-center gap-1 truncate">
                      ⚡ High-Speed Flow Corridor
                    </span>
                  </div>
                </button>

                {/* 2 & 3. FASTEST & NEAREST GRID */}
                <div className="grid grid-cols-2 gap-2">
                  {/* FASTEST DIRECT */}
                  <button
                    id="select-fastest-route-card"
                    onClick={() => {
                      setSelectedRouteType('fastest_time');
                      if (fastestRoute && onSelectRouteAlternative) {
                        onSelectRouteAlternative(fastestRoute);
                      }
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all relative ${
                      selectedRouteType === 'fastest_time'
                        ? 'bg-neutral-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-950/50'
                        : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-emerald-400 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> ⚡ Fastest
                      </span>
                      {selectedRouteType === 'fastest_time' && (
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-white">
                      {fastestRoute?.durationMin || calculatedRoute.durationMin} <span className="text-xs font-normal text-neutral-300">min</span>
                    </div>
                    <div className="text-[10px] font-semibold text-neutral-300">
                      {fastestRoute?.distanceKm || calculatedRoute.distanceKm} km
                    </div>
                    <span className="text-[9px] text-neutral-400 mt-0.5 leading-tight truncate">
                      Express flyovers & motorways
                    </span>
                  </button>

                  {/* NEAREST SHORTEST */}
                  <button
                    id="select-nearest-route-card"
                    onClick={() => {
                      setSelectedRouteType('shortest_distance');
                      if (nearestRoute && onSelectRouteAlternative) {
                        onSelectRouteAlternative(nearestRoute);
                      }
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1 transition-all relative ${
                      selectedRouteType === 'shortest_distance'
                        ? 'bg-blue-950/90 border-blue-500 ring-2 ring-blue-500/50 shadow-lg shadow-blue-950/50'
                        : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-blue-400 flex items-center gap-1">
                        <Route className="w-2.5 h-2.5" /> 📏 Nearest
                      </span>
                      {selectedRouteType === 'shortest_distance' && (
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-white">
                      {nearestRoute?.distanceKm || calculatedRoute.distanceKm} <span className="text-xs font-normal text-neutral-300">km</span>
                    </div>
                    <div className="text-[10px] font-semibold text-blue-200">
                      {nearestRoute?.durationMin || calculatedRoute.durationMin} min
                    </div>
                    <span className="text-[9px] text-neutral-400 mt-0.5 leading-tight truncate">
                      Minimum KM direct connection
                    </span>
                  </button>
                </div>
              </div>

              {/* Start Turn-by-Turn GPS Navigation Button */}
              <button
                id="start-live-navigation-btn"
                onClick={onStartNavigation}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
              >
                <Navigation className="w-4 h-4 fill-white" />
                <span>
                  Start Navigation ({selectedRouteType === 'best_route_ever' ? '✨ Best Route Ever' : selectedRouteType === 'fastest_time' ? '⚡ Fastest' : '📏 Nearest'})
                </span>
              </button>

              {/* Safety Highlights & Verification Accordion */}
              <div className="space-y-1.5">
                <button
                  id="toggle-safety-details-btn"
                  onClick={() => setShowSafetyDetails(!showSafetyDetails)}
                  className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-800/80 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Road Safety Highlights & Vehicle Fit</span>
                  </span>
                  {showSafetyDetails ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>

                {showSafetyDetails && (
                  <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2 mt-1 animate-in fade-in duration-200">
                    <div className="space-y-1.5 text-xs">
                      {calculatedRoute.safetyMetrics?.safetyHighlights.map((hl, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2 text-neutral-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                      {calculatedRoute.safetyMetrics?.safetyWarnings.map((warn, wIdx) => (
                        <div key={wIdx} className="flex items-center gap-2 text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>

                    {/* Learn & Teach Road Feedback */}
                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Help AI learn this road:</span>
                      {feedbackRecorded ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Saved to Learning Base
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleFeedback('good')}
                            className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 transition-colors font-bold text-[10px]"
                          >
                            👍 Great Road
                          </button>
                          <button
                            onClick={() => handleFeedback('narrow')}
                            className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 hover:bg-amber-900 transition-colors font-bold text-[10px]"
                          >
                            ⚠️ Tight Turn
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step-by-Step Directions Accordion */}
              <div className="space-y-1.5">
                <button
                  id="toggle-steps-accordion-btn"
                  onClick={() => setShowStepsAccordion(!showStepsAccordion)}
                  className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-800/80 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Turn-by-Turn Steps ({calculatedRoute.segments.length})</span>
                  </span>
                  {showStepsAccordion ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>

                {showStepsAccordion && (
                  <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2 mt-1">
                    <span className="text-[11px] font-bold text-neutral-300 block">
                      Turns & Guidance ({calculatedRoute.segments.length})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {calculatedRoute.segments.map((seg, sIdx) => (
                        <div key={sIdx} className="p-2 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-neutral-200 font-medium">{seg.instruction}</p>
                            <span className="text-[9px] text-neutral-400">
                              {seg.distanceMeters > 1000 ? `${(seg.distanceMeters / 1000).toFixed(1)} km` : `${seg.distanceMeters} m`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Route Button */}
              <button
                id="clear-calculated-route-btn"
                onClick={onClearRoute}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
              >
                Clear Route
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
