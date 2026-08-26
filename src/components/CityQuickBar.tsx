import React, { useState } from 'react';
import { MAJOR_CITIES } from '../data/pakistanLocations';
import { KARACHI_AREAS } from '../data/karachiAreas';
import { WORLD_CITIES, WORLD_LANDMARKS, WORLD_REGIONS, WorldRegion } from '../data/worldwideLocations';
import { RoutePoint } from '../types/map';
import { Globe, Building2, Landmark, Compass, MapPin, Sparkles } from 'lucide-react';

interface CityQuickBarProps {
  currentCenter: [number, number];
  onSelectCity: (city: RoutePoint) => void;
  onOpenKarachiTownModal: () => void;
  onSelectRegion?: (region: WorldRegion) => void;
}

type ExplorerCategory = 'world' | 'wonders' | 'pakistan' | 'regions';

export function CityQuickBar({
  currentCenter,
  onSelectCity,
  onOpenKarachiTownModal,
  onSelectRegion,
}: CityQuickBarProps) {
  const [activeCategory, setActiveCategory] = useState<ExplorerCategory>('world');

  // Sort with Karachi, Lahore, Islamabad first for Pakistan tab
  const prioritizedPakistanCities = [
    MAJOR_CITIES.find(c => c.id === 'khi') || MAJOR_CITIES[3],
    MAJOR_CITIES.find(c => c.id === 'lhr') || MAJOR_CITIES[2],
    MAJOR_CITIES.find(c => c.id === 'isb') || MAJOR_CITIES[0],
    MAJOR_CITIES.find(c => c.id === 'rwp') || MAJOR_CITIES[1],
    ...MAJOR_CITIES.filter(c => !['khi', 'lhr', 'isb', 'rwp'].includes(c.id)),
  ];

  return (
    <div id="world-explorer-bar" className="flex flex-col gap-1.5 py-1 px-1 pointer-events-auto">
      {/* Category Selector Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button
          id="cat-tab-world"
          onClick={() => setActiveCategory('world')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            activeCategory === 'world'
              ? 'bg-blue-600 text-white border-blue-500 shadow-md scale-105'
              : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white backdrop-blur-md'
          }`}
        >
          <Globe className="w-3 h-3 text-blue-300" />
          <span>World Megacities</span>
        </button>

        <button
          id="cat-tab-wonders"
          onClick={() => setActiveCategory('wonders')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            activeCategory === 'wonders'
              ? 'bg-amber-600 text-white border-amber-500 shadow-md scale-105'
              : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white backdrop-blur-md'
          }`}
        >
          <Landmark className="w-3 h-3 text-amber-300" />
          <span>Global Wonders</span>
        </button>

        <button
          id="cat-tab-pakistan"
          onClick={() => setActiveCategory('pakistan')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            activeCategory === 'pakistan'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-105'
              : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white backdrop-blur-md'
          }`}
        >
          <span className="text-xs">🇵🇰</span>
          <span>Pakistan</span>
        </button>

        <button
          id="cat-tab-regions"
          onClick={() => setActiveCategory('regions')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            activeCategory === 'regions'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md scale-105'
              : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white backdrop-blur-md'
          }`}
        >
          <Compass className="w-3 h-3 text-purple-300" />
          <span>Continents / Fly-To</span>
        </button>

        {/* Dedicated Karachi Areas Modal Button */}
        <button
          id="open-karachi-towns-btn"
          onClick={onOpenKarachiTownModal}
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md border border-emerald-400/30 ml-auto"
        >
          <Building2 className="w-3 h-3" />
          <span>Karachi Towns ({KARACHI_AREAS.length})</span>
        </button>
      </div>

      {/* Horizontal Place Jump Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {activeCategory === 'world' &&
          WORLD_CITIES.map(city => {
            const isNearby =
              Math.abs(currentCenter[0] - city.lat) < 0.25 &&
              Math.abs(currentCenter[1] - city.lng) < 0.25;

            return (
              <button
                key={city.id}
                id={`jump-world-${city.id}`}
                onClick={() => onSelectCity(city)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isNearby
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md scale-105 ring-2 ring-blue-400/40'
                    : 'bg-neutral-900/85 text-neutral-200 border-neutral-750 hover:border-blue-500 hover:text-white backdrop-blur-md'
                }`}
              >
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>{city.name}</span>
                {city.province && <span className="text-[10px] text-neutral-400">({city.province})</span>}
              </button>
            );
          })}

        {activeCategory === 'wonders' &&
          WORLD_LANDMARKS.map(landmark => {
            const isNearby =
              Math.abs(currentCenter[0] - landmark.lat) < 0.15 &&
              Math.abs(currentCenter[1] - landmark.lng) < 0.15;

            return (
              <button
                key={landmark.id}
                id={`jump-wonder-${landmark.id}`}
                onClick={() => onSelectCity(landmark)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isNearby
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md scale-105 ring-2 ring-amber-400/40'
                    : 'bg-neutral-900/85 text-neutral-200 border-neutral-750 hover:border-amber-500 hover:text-white backdrop-blur-md'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{landmark.name}</span>
                {landmark.city && <span className="text-[10px] text-neutral-400">({landmark.city})</span>}
              </button>
            );
          })}

        {activeCategory === 'pakistan' &&
          prioritizedPakistanCities.map(city => {
            const isNearby =
              Math.abs(currentCenter[0] - city.lat) < 0.18 &&
              Math.abs(currentCenter[1] - city.lng) < 0.18;

            return (
              <button
                key={city.id}
                id={`jump-pk-${city.id}`}
                onClick={() => onSelectCity(city)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 border ${
                  isNearby
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-105'
                    : 'bg-neutral-900/85 text-neutral-300 border-neutral-750 hover:border-neutral-600 hover:text-white backdrop-blur-md'
                }`}
              >
                <span>{city.name}</span>
              </button>
            );
          })}

        {activeCategory === 'regions' &&
          WORLD_REGIONS.map(region => (
            <button
              key={region.id}
              id={`jump-region-${region.id}`}
              onClick={() => {
                if (onSelectRegion) {
                  onSelectRegion(region);
                } else {
                  onSelectCity({
                    id: region.id,
                    name: region.name,
                    lat: region.center[0],
                    lng: region.center[1],
                    type: 'city',
                  });
                }
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 bg-neutral-900/85 text-neutral-200 border border-neutral-750 hover:border-purple-500 hover:text-white backdrop-blur-md"
            >
              <span>{region.icon}</span>
              <span>{region.name}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
