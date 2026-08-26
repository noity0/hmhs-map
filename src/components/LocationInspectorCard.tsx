import React from 'react';
import { RoutePoint } from '../types/map';
import { MapPin, Navigation, Compass, X, Copy, Check, Star, Share2 } from 'lucide-react';
import { favoritesService } from '../services/favoritesService';

interface LocationInspectorCardProps {
  location: RoutePoint | { name: string; address?: string; lat: number; lng: number; gullyDetail?: string } | null;
  onClose: () => void;
  onSetAsDestination: (point: RoutePoint) => void;
  onSetAsOrigin: (point: RoutePoint) => void;
}

export function LocationInspectorCard({
  location,
  onClose,
  onSetAsDestination,
  onSetAsOrigin,
}: LocationInspectorCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [isFav, setIsFav] = React.useState(false);

  React.useEffect(() => {
    if (location) {
      setIsFav(favoritesService.isFavorite((location as any).id));
    }
  }, [location]);

  if (!location) return null;

  const point: RoutePoint = {
    id: (location as any).id || `loc-${Date.now()}`,
    name: location.name,
    urduName: (location as any).urduName,
    lat: location.lat,
    lng: location.lng,
    address: location.address,
    city: (location as any).city,
    type: (location as any).type || 'custom',
  };

  const handleToggleFavorite = () => {
    const updatedStatus = favoritesService.toggleFavorite(point);
    setIsFav(updatedStatus);
  };

  const handleShareLocation = () => {
    const shareUrl = `${window.location.origin}/?lat=${location.lat.toFixed(5)}&lng=${location.lng.toFixed(5)}&q=${encodeURIComponent(location.name)}`;
    if (navigator.share) {
      navigator.share({
        title: location.name,
        text: `HMHS Map Location: ${location.name}`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="location-inspector-card"
      className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 w-full sm:w-96 pointer-events-auto animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
              {location.name}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed line-clamp-2">
              {location.address || `Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-lg border transition-colors ${
              isFav ? 'bg-amber-950/80 border-amber-500/60 text-amber-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-amber-300'
            }`}
            title={isFav ? 'Remove from Starred Places' : 'Star / Save Place'}
          >
            <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
          </button>
          <button
            id="close-location-inspector-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-500 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800/80">
        <span className="font-mono text-neutral-400">
          {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareLocation}
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            title="Share Place Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <span className="text-neutral-700">•</span>
          <button
            onClick={handleCopyCoordinates}
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'GPS'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <button
          id="directions-to-here-btn"
          onClick={() => {
            onSetAsDestination(point);
            onClose();
          }}
          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5 fill-white" />
          <span>Directions To Here</span>
        </button>

        <button
          id="start-route-from-here-btn"
          onClick={() => {
            onSetAsOrigin(point);
            onClose();
          }}
          className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>Start From Here</span>
        </button>
      </div>
    </div>
  );
}
