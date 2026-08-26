import { useState } from 'react';
import { LearnedRouteMemory, RoutePoint } from '../types/map';
import { routeLearningService, RouteLearningStats } from '../services/routeLearningService';
import { Brain, ShieldCheck, Sparkles, Navigation, Award, CheckCircle2, TrendingUp, X, MapPin, Gauge } from 'lucide-react';

interface LearnedRoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLearnedCorridor: (origin: RoutePoint, destination: RoutePoint) => void;
}

export function LearnedRoutesModal({
  isOpen,
  onClose,
  onSelectLearnedCorridor,
}: LearnedRoutesModalProps) {
  const [learnedRoutes, setLearnedRoutes] = useState<LearnedRouteMemory[]>(() =>
    routeLearningService.getAllLearnedRoutes()
  );
  const [stats, setStats] = useState<RouteLearningStats>(() => routeLearningService.getStats());
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredRoutes = learnedRoutes.filter(r => {
    if (filterType === 'all') return true;
    if (filterType === 'best_ever') return r.routeType === 'best_route_ever';
    if (filterType === 'safest') return r.safetyRating >= 96;
    if (filterType === 'fastest') return r.routeType === 'fastest_time';
    return true;
  });

  const handleSelect = (route: LearnedRouteMemory) => {
    const originPoint: RoutePoint = {
      id: `pt-learned-origin-${Date.now()}`,
      name: route.originName,
      lat: route.polyline[0]?.[0] || 24.8607,
      lng: route.polyline[0]?.[1] || 67.0011,
      type: 'city',
    };
    const destPoint: RoutePoint = {
      id: `pt-learned-dest-${Date.now()}`,
      name: route.destinationName,
      lat: route.polyline[route.polyline.length - 1]?.[0] || 24.8607,
      lng: route.polyline[route.polyline.length - 1]?.[1] || 67.0011,
      type: 'city',
    };
    onSelectLearnedCorridor(originPoint, destPoint);
    onClose();
  };

  return (
    <div
      id="learned-routes-modal"
      className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 via-neutral-900 to-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Learned Road Knowledge Base
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Self-Learning AI Active
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Learned and verified safe road corridors, bypasses & multi-lane expressways
              </p>
            </div>
          </div>
          <button
            id="close-learned-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 bg-neutral-950/70 border-b border-neutral-800/80">
          <div className="p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <Brain className="w-3 h-3 text-emerald-400" /> Corridors Learned
            </span>
            <span className="text-lg font-black text-white mt-0.5">{stats.totalLearnedCorridors}</span>
            <span className="text-[9px] text-emerald-400">100% Real Roadways</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-400" /> Total Trips Logged
            </span>
            <span className="text-lg font-black text-white mt-0.5">{stats.totalTripsLogged.toLocaleString()}</span>
            <span className="text-[9px] text-blue-400">Continuous Training</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" /> Safe Road KM
            </span>
            <span className="text-lg font-black text-white mt-0.5">{stats.safeRoadMilesTrackedKm.toLocaleString()}</span>
            <span className="text-[9px] text-amber-400">Verified Clearances</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-800/80 bg-neutral-900/50 overflow-x-auto">
          <span className="text-xs text-neutral-400 font-semibold flex-shrink-0">Filter:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            All Corridors ({learnedRoutes.length})
          </button>
          <button
            onClick={() => setFilterType('best_ever')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1 flex-shrink-0 ${
              filterType === 'best_ever'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-300" /> ✨ Best Route Ever
          </button>
          <button
            onClick={() => setFilterType('safest')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1 flex-shrink-0 ${
              filterType === 'safest'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Ultra Safe (96%+)
          </button>
          <button
            onClick={() => setFilterType('fastest')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1 flex-shrink-0 ${
              filterType === 'fastest'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" /> Expressways
          </button>
        </div>

        {/* Learned Routes List */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2.5">
          {filteredRoutes.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              No learned routes match the selected filter.
            </div>
          ) : (
            filteredRoutes.map(route => (
              <div
                key={route.id}
                id={`learned-route-card-${route.id}`}
                onClick={() => handleSelect(route)}
                className="p-3.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800/90 border border-neutral-800 hover:border-emerald-500/60 transition-all cursor-pointer group flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {route.originName} → {route.destinationName}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {route.tripCount} Trips Learned
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300 font-semibold mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      {route.corridorName}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center justify-end gap-1 text-xs font-black text-white">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{route.safetyRating}% Safe</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      {route.distanceKm} km • ~{route.avgDurationMin} min
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed bg-neutral-900/60 p-2 rounded-xl border border-neutral-800/60">
                  {route.notes}
                </p>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/60">
                  <span>Last active: {route.lastNavigated}</span>
                  <span className="text-emerald-400 font-bold group-hover:underline flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> Tap to Navigate this Safe Corridor
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            🤖 Engine automatically learns and refines real routes as you search and navigate.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
