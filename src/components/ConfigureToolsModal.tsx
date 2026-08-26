import React from 'react';
import { 
  X, 
  Layers, 
  Flame, 
  Ruler, 
  ShieldCheck, 
  Brain, 
  Globe, 
  Building2, 
  Sparkles, 
  PhoneCall, 
  Car, 
  Compass, 
  SlidersHorizontal,
  Check,
  Zap,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { MapProvider, VehicleProfile } from '../types/map';

interface ConfigureToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapProvider: MapProvider;
  onChangeMapProvider: (provider: MapProvider) => void;
  showTraffic: boolean;
  onToggleTraffic: () => void;
  isMeasuringDistance: boolean;
  onToggleDistanceMeasure: () => void;
  selectedVehicle: VehicleProfile | null;
  onOpenVehicleModal: () => void;
  onOpenLearnedRoutesModal: () => void;
  onOpenKarachiModal: () => void;
  onOpenReadOnlyModal: () => void;
  onOpenSeoModal: () => void;
  showExploreBar: boolean;
  onToggleExploreBar: () => void;
  onOpenEmergencyBanner: () => void;
  trafficCount: number;
}

export function ConfigureToolsModal({
  isOpen,
  onClose,
  mapProvider,
  onChangeMapProvider,
  showTraffic,
  onToggleTraffic,
  isMeasuringDistance,
  onToggleDistanceMeasure,
  selectedVehicle,
  onOpenVehicleModal,
  onOpenLearnedRoutesModal,
  onOpenKarachiModal,
  onOpenReadOnlyModal,
  onOpenSeoModal,
  showExploreBar,
  onToggleExploreBar,
  onOpenEmergencyBanner,
  trafficCount
}: ConfigureToolsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] text-xs animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm">Configure & Tools</h3>
              <p className="text-[10px] text-neutral-400">All features & map controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
          
          {/* SECTION 1: MAP STYLES & LAYERS */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Map Styles & Layers
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeMapProvider('carto-voyager')}
                className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  mapProvider === 'carto-voyager'
                    ? 'bg-emerald-950/90 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/50'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span>Clean Streets</span>
                {mapProvider === 'carto-voyager' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => onChangeMapProvider('osm-streets')}
                className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  mapProvider === 'osm-streets'
                    ? 'bg-emerald-950/90 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/50'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span>HD Gullies (OSM)</span>
                {mapProvider === 'osm-streets' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => onChangeMapProvider('esri-satellite')}
                className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  mapProvider === 'esri-satellite'
                    ? 'bg-emerald-950/90 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/50'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span>Satellite View</span>
                {mapProvider === 'esri-satellite' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => onChangeMapProvider('carto-dark')}
                className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  mapProvider === 'carto-dark'
                    ? 'bg-emerald-950/90 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/50'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span>Night Dark Mode</span>
                {mapProvider === 'carto-dark' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Traffic Toggle */}
            <button
              onClick={onToggleTraffic}
              className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all ${
                showTraffic
                  ? 'bg-orange-950/80 border-orange-500/80 text-orange-300 font-bold'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Traffic Incidents Overlay ({trafficCount})</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${showTraffic ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                {showTraffic ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* SECTION 2: NAVIGATION & VEHICLE TOOLS */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-400" /> Vehicle & Navigation Tools
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => { onOpenVehicleModal(); onClose(); }}
                className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 hover:border-blue-500/60 text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{selectedVehicle ? selectedVehicle.icon : '🚗'}</span>
                  <div>
                    <strong className="text-white block">{selectedVehicle ? selectedVehicle.name : 'Vehicle Profile'}</strong>
                    <span className="text-[10px] text-neutral-400">Configure weight & speed</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { onToggleDistanceMeasure(); onClose(); }}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isMeasuringDistance
                    ? 'bg-blue-950/90 border-blue-500 text-blue-300 font-bold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-blue-500/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Ruler className="w-4 h-4 text-blue-400" />
                  <div>
                    <strong className="text-white block">Distance Ruler</strong>
                    <span className="text-[10px] text-neutral-400">Measure map distance</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { onOpenLearnedRoutesModal(); onClose(); }}
                className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 hover:border-emerald-500/60 text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <div>
                    <strong className="text-white block">Learned Road Base</strong>
                    <span className="text-[10px] text-neutral-400">Flyover & carriageway data</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { onOpenKarachiModal(); onClose(); }}
                className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800 hover:border-emerald-500/60 text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <strong className="text-white block">Karachi Areas & Towns</strong>
                    <span className="text-[10px] text-neutral-400">18+ Towns & Gullies</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 3: SEO & SHARING LINKS */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" /> Public Links & SEO
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="btn-modal-readonly-share"
                onClick={() => { onOpenReadOnlyModal(); onClose(); }}
                className="p-3 rounded-2xl bg-blue-950/70 border border-blue-500/40 hover:bg-blue-900/80 text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <div>
                    <strong className="text-blue-300 block font-black">🔒 Read-Only Live Link</strong>
                    <span className="text-[10px] text-blue-200/70">Share view-only map link</span>
                  </div>
                </div>
              </button>

              <button
                id="btn-modal-seo-indexing"
                onClick={() => { onOpenSeoModal(); onClose(); }}
                className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/80 text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <div>
                    <strong className="text-emerald-300 block font-black">⚡ 1-Click Google SEO</strong>
                    <span className="text-[10px] text-emerald-200/70">Push pings to search bots</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 4: PLACES & EMERGENCY HELPLINES */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Explore & Helplines
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => { onToggleExploreBar(); onClose(); }}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  showExploreBar
                    ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 font-bold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <strong className="text-white block">Explore Places Nearby</strong>
                    <span className="text-[10px] text-neutral-400">Fuel, ATMs, Hospitals</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { onOpenEmergencyBanner(); onClose(); }}
                className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 hover:bg-red-900/80 text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-red-400" />
                  <div>
                    <strong className="text-red-300 block">Emergency SOS 130</strong>
                    <span className="text-[10px] text-red-200/70">Motorway Police & Rescue</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-400">
          <span>HMHS Map v2.5 • Clean Mobile Layout</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
