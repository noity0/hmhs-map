import { useState, useEffect } from 'react';
import { CalculatedRoute, RouteSegment } from '../types/map';
import { 
  ArrowUp, 
  ArrowUpRight, 
  ArrowUpLeft, 
  CornerUpRight, 
  CornerUpLeft, 
  RotateCcw, 
  MapPin, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Gauge, 
  Play, 
  Pause, 
  CheckCircle,
  Zap,
  Navigation
} from 'lucide-react';

interface NavigationBannerProps {
  route: CalculatedRoute;
  currentStepIndex: number;
  isNavigating: number; // 0 = stopped, 1 = active, 2 = paused, 3 = simulating
  onStopNavigation: () => void;
  onTogglePause: () => void;
  onStepChange?: (index: number) => void;
  onCompleteRoute?: () => void;
  onToggleSimulation?: () => void;
  isSimulating?: boolean;
  simSpeed?: number;
  onChangeSimSpeed?: (speed: number) => void;
  speedKmh?: number;
}

export function NavigationBanner({
  route,
  currentStepIndex,
  isNavigating,
  onStopNavigation,
  onTogglePause,
  onStepChange,
  onCompleteRoute,
  onToggleSimulation,
  isSimulating = false,
  simSpeed = 2,
  onChangeSimSpeed,
  speedKmh = 48,
}: NavigationBannerProps) {
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentSegment: RouteSegment = route.segments[currentStepIndex] || route.segments[0];
  const nextSegment: RouteSegment | undefined = route.segments[currentStepIndex + 1];
  const totalSteps = route.segments.length;
  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / totalSteps) * 100));

  // Text to Speech for Navigation instructions
  useEffect(() => {
    if (isNavigating === 1 && !isVoiceMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any prior speech
      const textToSpeak = `${currentSegment.instruction}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentStepIndex, isNavigating, isVoiceMuted, currentSegment]);

  const renderManeuverIcon = (maneuver: RouteSegment['maneuver'], className = 'w-8 h-8') => {
    switch (maneuver) {
      case 'turn-left':
        return <CornerUpLeft className={className} />;
      case 'turn-right':
        return <CornerUpRight className={className} />;
      case 'slight-left':
        return <ArrowUpLeft className={className} />;
      case 'slight-right':
        return <ArrowUpRight className={className} />;
      case 'u-turn':
        return <RotateCcw className={className} />;
      case 'destination':
        return <MapPin className={className} />;
      default:
        return <ArrowUp className={className} />;
    }
  };

  // Calculate remaining distance and time
  const remainingDistanceKm = Math.max(
    0.1,
    Number((route.distanceKm * (1 - currentStepIndex / Math.max(1, route.segments.length))).toFixed(1))
  );
  const remainingMinutes = Math.max(
    1,
    Math.round(route.durationMin * (1 - currentStepIndex / Math.max(1, route.segments.length)))
  );

  const arrivalTime = new Date(Date.now() + remainingMinutes * 60000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrevStep = () => {
    if (onStepChange && currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      if (onStepChange) onStepChange(currentStepIndex + 1);
    } else {
      if (onCompleteRoute) onCompleteRoute();
    }
  };

  return (
    <div id="navigation-banner-container" className="fixed top-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none p-2 sm:p-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
      {/* Main Top Navigation HUD */}
      <div className="w-full max-w-xl bg-emerald-800 text-white rounded-2xl shadow-2xl border border-emerald-600/60 overflow-hidden pointer-events-auto transition-all duration-300">
        
        {/* Progress Bar at very top */}
        <div className="w-full bg-emerald-950 h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-3 sm:p-4 flex items-center justify-between gap-2.5">
          {/* Turn Icon */}
          <div className="flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 bg-emerald-950/70 border border-emerald-400/40 rounded-xl flex items-center justify-center text-emerald-200 shadow-inner">
            {renderManeuverIcon(currentSegment.maneuver, 'w-6 h-6 sm:w-8 sm:h-8 text-emerald-300')}
          </div>

          {/* Turn Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-white">
                {currentSegment.distanceMeters >= 1000
                  ? `${(currentSegment.distanceMeters / 1000).toFixed(1)} km`
                  : `${currentSegment.distanceMeters} m`}
              </span>
              <span className="text-[11px] sm:text-xs text-emerald-200 font-medium truncate">
                then {nextSegment ? nextSegment.roadName : 'Destination'}
              </span>
            </div>
            <h3 className="text-xs sm:text-base font-bold text-emerald-50 leading-snug line-clamp-2">
              {currentSegment.instruction}
            </h3>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              id="toggle-voice-guidance-btn"
              onClick={() => setIsVoiceMuted(!isVoiceMuted)}
              className="p-2 sm:p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-100 transition-colors"
              title={isVoiceMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
            </button>
            <button
              id="stop-navigation-btn"
              onClick={onStopNavigation}
              className="p-2 sm:p-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 border border-red-400 text-white transition-colors"
              title="Exit Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Navigation Bar & Telemetry */}
        <div className="px-3 sm:px-4 py-2 bg-emerald-950/80 border-t border-emerald-700/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-emerald-300">{remainingDistanceKm} km left</span>
            <span className="text-emerald-400/50">•</span>
            <span className="text-emerald-200">{remainingMinutes} min</span>
            <span className="text-emerald-400/50">•</span>
            <span className="text-neutral-300 font-medium">ETA {arrivalTime}</span>
          </div>

          {/* Quick Step Buttons */}
          <div className="flex items-center gap-1">
            <button
              id="nav-prev-step-btn"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`p-1 rounded-lg border text-xs font-bold transition-all ${
                currentStepIndex === 0
                  ? 'opacity-30 border-transparent text-neutral-400 cursor-not-allowed'
                  : 'bg-emerald-900 hover:bg-emerald-800 border-emerald-600 text-emerald-200'
              }`}
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-[11px] text-emerald-200 px-1 font-bold">
              {currentStepIndex + 1}/{totalSteps}
            </span>

            <button
              id="nav-next-step-btn"
              onClick={handleNextStep}
              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white text-xs font-bold flex items-center gap-1 transition-all shadow"
              title={currentStepIndex === totalSteps - 1 ? 'Complete Navigation' : 'Next Step'}
            >
              {currentStepIndex === totalSteps - 1 ? (
                <><CheckCircle className="w-3.5 h-3.5 text-emerald-200" /> Arrive</>
              ) : (
                <>Next <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </button>

            <button
              id="expand-steps-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-emerald-300 hover:text-white transition-colors flex items-center gap-0.5 font-bold px-1 py-1"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Step List */}
        {isExpanded && (
          <div className="max-h-60 overflow-y-auto bg-neutral-900 border-t border-neutral-800 p-3 flex flex-col gap-2">
            {route.segments.map((seg, idx) => (
              <div
                key={idx}
                id={`nav-step-${idx}`}
                onClick={() => onStepChange && onStepChange(idx)}
                className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                  idx === currentStepIndex
                    ? 'bg-emerald-900/40 border border-emerald-500 text-white'
                    : 'bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 border border-transparent'
                }`}
              >
                <div className="mt-0.5 text-emerald-400">{renderManeuverIcon(seg.maneuver, 'w-4 h-4')}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{seg.instruction}</p>
                  <p className="text-[10px] text-emerald-400/80 mt-0.5">
                    {seg.distanceMeters} m • {Math.round(seg.durationSeconds / 60)} min
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simulator Control & Complete Route Floater */}
      <div className="mt-2 bg-neutral-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-2xl border border-neutral-700/80 flex items-center gap-2.5 pointer-events-auto">
        <span className="text-[11px] text-neutral-300 font-semibold flex items-center gap-1">
          <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
          Simulation:
        </span>
        
        {onToggleSimulation && (
          <button
            id="sim-play-toggle-btn"
            onClick={onToggleSimulation}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border transition-all ${
              isSimulating
                ? 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-white animate-pulse'
                : 'bg-emerald-950 hover:bg-emerald-900 border-emerald-700 text-emerald-300'
            }`}
          >
            {isSimulating ? <><Pause className="w-3 h-3" /> Auto Drive</> : <><Play className="w-3 h-3" /> Auto Drive</>}
          </button>
        )}

        {/* Speed Selector */}
        {onChangeSimSpeed && (
          <div className="flex items-center gap-1">
            {[1, 2, 5, 10].map(s => (
              <button
                key={s}
                onClick={() => onChangeSimSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  simSpeed === s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}

        <div className="h-3 w-px bg-neutral-700 mx-0.5" />

        {onCompleteRoute && (
          <button
            id="complete-route-direct-btn"
            onClick={onCompleteRoute}
            className="flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white px-2 py-0.5 bg-emerald-950/80 rounded-full border border-emerald-600/60 hover:bg-emerald-900 transition-all"
          >
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
