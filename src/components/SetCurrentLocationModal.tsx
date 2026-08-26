import React, { useState, useEffect } from 'react';
import { RoutePoint } from '../types/map';
import { KARACHI_AREAS } from '../data/karachiAreas';
import { MAJOR_CITIES, FAMOUS_GULLIES_AND_STREETS } from '../data/pakistanLocations';
import { executeUniversalSearch, filterLocalLocations } from '../utils/searchUtils';
import { getRealHardwareGPS, saveUserSelectedCity } from '../services/locationService';
import { 
  LocateFixed, 
  Search, 
  MapPin, 
  X, 
  Check, 
  Sparkles, 
  Loader2, 
  Compass, 
  Navigation, 
  Building2, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';

interface SetCurrentLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationName: string;
  currentCoordinates: [number, number] | null;
  onLocationSelected: (point: RoutePoint, isGps: boolean) => void;
  onEnableMapPinpointMode: () => void;
}

export function SetCurrentLocationModal({
  isOpen,
  onClose,
  currentLocationName,
  currentCoordinates,
  onLocationSelected,
  onEnableMapPinpointMode,
}: SetCurrentLocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAcquiringGps, setIsAcquiringGps] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [searchResults, setSearchResults] = useState<RoutePoint[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'karachi' | 'cities'>('search');

  // Universal Search autocomplete (Instant local + Online geocoding)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingOnline(false);
      return;
    }

    // Instant local results first
    const localMatches = filterLocalLocations(searchQuery, 25);
    setSearchResults(localMatches);
    setIsSearchingOnline(true);

    const timer = setTimeout(async () => {
      try {
        const { combinedResults } = await executeUniversalSearch(searchQuery);
        setSearchResults(combinedResults);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  // 1-Click Hardware GPS Trigger with multi-stage resolution
  const handleAcquireRealGPS = async () => {
    setIsAcquiringGps(true);
    setGpsError(null);
    setGpsStatusMessage('Polling device hardware GPS & Wi-Fi sensor...');
    try {
      const gpsRes = await getRealHardwareGPS();
      const pt: RoutePoint = {
        id: 'real-gps-detected',
        name: gpsRes.streetName || 'My Real GPS Location',
        lat: gpsRes.coordinates[0],
        lng: gpsRes.coordinates[1],
        type: 'custom',
        address: `Live Geolocation (±${Math.round(gpsRes.accuracyMeters || 10)}m accuracy via ${gpsRes.source.toUpperCase()})`,
      };
      saveUserSelectedCity(pt.name, pt.lat, pt.lng);
      onLocationSelected(pt, true);
      onClose();
    } catch (err: any) {
      setGpsError(
        err.message || 'GPS access could not be acquired directly in preview iframe. You can open in a new tab or pick your exact neighborhood below.'
      );
    } finally {
      setIsAcquiringGps(false);
      setGpsStatusMessage(null);
    }
  };

  const handleSelectArea = (pt: RoutePoint) => {
    saveUserSelectedCity(pt.name, pt.lat, pt.lng);
    onLocationSelected(pt, false);
    onClose();
  };

  const handleOpenInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  return (
    <div
      id="set-current-location-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
              <LocateFixed className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Set Real Current Location
              </h3>
              <p className="text-xs text-neutral-400">
                Priority: Live Real Location or Instant Area Picker
              </p>
            </div>
          </div>

          <button
            id="close-set-location-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Priority #1: Hardware GPS Callout Button */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-blue-900/40 to-neutral-900 border border-blue-500/50 flex flex-col gap-2.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
                Priority 1: Live Hardware GPS
              </span>
              {currentCoordinates && (
                <span className="text-[11px] font-mono text-neutral-400">
                  {currentCoordinates[0].toFixed(4)}°, {currentCoordinates[1].toFixed(4)}°
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-200">
              Query real device hardware GPS sensor / Wi-Fi triangulation to pinpoint your exact spot.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                id="acquire-real-gps-now-btn"
                onClick={handleAcquireRealGPS}
                disabled={isAcquiringGps}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isAcquiringGps ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{gpsStatusMessage || 'Reading GPS...'}</span>
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-4 h-4 text-white" />
                    <span>Acquire Real Current GPS Location</span>
                  </>
                )}
              </button>

              <button
                id="open-in-new-tab-gps-btn"
                onClick={handleOpenInNewTab}
                className="py-3 px-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 transition-colors"
                title="Open in full browser window without iframe sandbox"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">New Tab (Direct GPS)</span>
              </button>
            </div>

            {gpsError && (
              <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-500/50 text-[11px] text-amber-200 flex flex-col gap-1.5">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong>Why browser permission may not trigger:</strong> Inside embedded sandboxed iframe previews, browser security may restrict direct sensor prompts. 
                  </div>
                </div>
                <div className="pl-6 flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleOpenInNewTab}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Open App in Full New Tab
                  </button>
                  <span className="text-[10px] text-amber-300">or pick your exact Karachi area below:</span>
                </div>
              </div>
            )}
          </div>

          {/* Priority #2: Pinpoint on Map Option */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <div>
                <strong className="text-xs text-white block">Tap & Pinpoint on Map</strong>
                <span className="text-[10px] text-neutral-400">Click any spot or gully on the map to set current location</span>
              </div>
            </div>
            <button
              id="pinpoint-on-map-btn"
              onClick={() => {
                onEnableMapPinpointMode();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Pinpoint on Map
            </button>
          </div>

          {/* Priority #3: Manual Search & Preset Tabs */}
          <div>
            <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 mb-3">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'search'
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Search Any Street
              </button>
              <button
                onClick={() => setActiveTab('karachi')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'karachi'
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Karachi Areas ({KARACHI_AREAS.length})
              </button>
              <button
                onClick={() => setActiveTab('cities')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'cities'
                    ? 'bg-neutral-800 text-white shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Major Cities
              </button>
            </div>

            {/* Tab 1: Live Nominatim Street Search */}
            {activeTab === 'search' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="manual-location-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Type your exact street, chowk, town, or area (e.g. Gulshan Block 13)..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                  {isSearchingOnline && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400 animate-spin" />
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {searchResults.map((loc, idx) => (
                    <button
                      key={`${loc.id}-${idx}`}
                      onClick={() => handleSelectArea(loc)}
                      className="w-full text-left p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800/80 flex items-start gap-2.5 transition-colors group"
                    >
                      <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 group-hover:scale-110" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white truncate block">{loc.name}</span>
                        <p className="text-[10px] text-neutral-400 truncate">{loc.address || loc.city || loc.province}</p>
                      </div>
                    </button>
                  ))}
                  {searchQuery && searchResults.length === 0 && !isSearchingOnline && (
                    <div className="p-3 text-center text-xs text-neutral-400">
                      No matching street or area found for "{searchQuery}". Try a broader area or city name.
                    </div>
                  )}
                  {!searchQuery && (
                    <div className="p-3 text-center text-xs text-neutral-500">
                      Type any Pakistani mohallah, gully, sector, or chowk to search.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Karachi Towns */}
            {activeTab === 'karachi' && (
              <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                {KARACHI_AREAS.map(area => (
                  <button
                    key={area.id}
                    onClick={() => handleSelectArea(area)}
                    className="text-left p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800/80 transition-colors flex flex-col"
                  >
                    <span className="text-xs font-bold text-white truncate">{area.name}</span>
                    <span className="text-[10px] text-neutral-400 truncate">{area.zone}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tab 3: Major Cities */}
            {activeTab === 'cities' && (
              <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                {MAJOR_CITIES.map(city => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectArea(city)}
                    className="text-left p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800/80 transition-colors flex flex-col"
                  >
                    <span className="text-xs font-bold text-white truncate">{city.name}</span>
                    <span className="text-[10px] text-neutral-400 truncate">{city.province}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
