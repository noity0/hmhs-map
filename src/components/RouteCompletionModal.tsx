import { CalculatedRoute } from '../types/map';
import { Trophy, CheckCircle, Navigation, ShieldCheck, Zap, Sparkles, X } from 'lucide-react';

interface RouteCompletionModalProps {
  route: CalculatedRoute;
  onClose: () => void;
  onNewRoute: () => void;
}

export function RouteCompletionModal({ route, onClose, onNewRoute }: RouteCompletionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in pointer-events-auto">
      <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/50 mb-3 animate-bounce">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <span className="px-3 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Trip Completed!
          </span>
          <h2 className="text-xl font-black text-white">You Have Arrived!</h2>
          <p className="text-sm text-neutral-300 mt-0.5 font-medium truncate max-w-xs">
            {route.destination.name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3 text-center">
            <div className="text-xs text-neutral-400 font-medium">Distance</div>
            <div className="text-lg font-black text-white mt-0.5">{route.distanceKm} km</div>
          </div>
          <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3 text-center">
            <div className="text-xs text-neutral-400 font-medium">Duration</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{route.durationMin} min</div>
          </div>
          <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-3 text-center">
            <div className="text-xs text-neutral-400 font-medium">Safety</div>
            <div className="text-lg font-black text-teal-300 mt-0.5">
              {route.safetyMetrics?.safetyScore || 99}%
            </div>
          </div>
        </div>

        {/* Corridor Highlights */}
        <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-3 mb-5 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-100">
            <span className="font-bold text-emerald-300">{route.corridorBadge || 'Ultra Live Routing Corridor'}: </span>
            {route.summary || 'Completed with 100% precision geometry.'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            id="finish-trip-close-btn"
            onClick={onClose}
            className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl font-bold text-sm transition-all border border-neutral-700"
          >
            Keep Map
          </button>
          <button
            id="start-new-trip-btn"
            onClick={onNewRoute}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/40"
          >
            New Trip
          </button>
        </div>
      </div>
    </div>
  );
}
