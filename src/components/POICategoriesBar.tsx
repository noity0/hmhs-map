import { POI } from '../types/map';
import { Fuel, Hospital, Utensils, Landmark, ShieldAlert, Compass, Navigation } from 'lucide-react';

interface POICategoriesBarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onSelectPOI: (poi: POI) => void;
  pois: POI[];
  isOfflineMode: boolean;
}

export function POICategoriesBar({
  selectedCategory,
  onSelectCategory,
  onSelectPOI,
  pois,
  isOfflineMode,
}: POICategoriesBarProps) {
  const categories = [
    { id: 'all', label: 'All Places', icon: Compass },
    { id: 'petrol', label: 'Petrol & CNG', icon: Fuel, color: 'text-amber-400' },
    { id: 'hospital', label: 'Hospitals & Emergency', icon: Hospital, color: 'text-red-400' },
    { id: 'mosque', label: 'Mosques', icon: Landmark, color: 'text-emerald-400' },
    { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'text-orange-400' },
    { id: 'police', label: 'Highway Police & Help', icon: ShieldAlert, color: 'text-blue-400' },
  ];

  const filteredPOIs = selectedCategory && selectedCategory !== 'all'
    ? pois.filter(p => p.category === selectedCategory)
    : [];

  return (
    <div id="poi-categories-bar" className="w-full flex flex-col gap-2 pointer-events-auto">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === (cat.id === 'all' ? null : cat.id);
          return (
            <button
              key={cat.id}
              id={`poi-category-${cat.id}`}
              onClick={() => onSelectCategory(cat.id === 'all' ? null : isActive ? null : cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-md backdrop-blur-md border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400/40 shadow-emerald-900/30'
                  : 'bg-neutral-900/90 text-neutral-200 border-neutral-700/70 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${cat.color || ''}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}

        {isOfflineMode && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Offline Mode Active
          </span>
        )}
      </div>

      {/* Expanded POI horizontal list when a category is picked */}
      {selectedCategory && filteredPOIs.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
          {filteredPOIs.map(poi => (
            <div
              key={poi.id}
              id={`poi-card-${poi.id}`}
              onClick={() => onSelectPOI(poi)}
              className="flex-shrink-0 bg-neutral-900/95 hover:bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 shadow-lg cursor-pointer transition-all hover:border-emerald-500 max-w-[220px]"
            >
              <div className="flex items-start justify-between gap-1">
                <h4 className="text-xs font-bold text-white truncate">{poi.name}</h4>
                {poi.rating && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">
                    ★ {poi.rating}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 truncate mt-0.5">{poi.address}</p>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-800 text-[10px]">
                <span className="text-emerald-400 font-medium">{poi.city}</span>
                <span className="flex items-center gap-0.5 text-neutral-300 hover:text-emerald-300">
                  <Navigation className="w-2.5 h-2.5 text-emerald-400" /> Go
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
