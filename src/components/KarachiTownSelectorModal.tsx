import React, { useState } from 'react';
import { KARACHI_AREAS, KarachiArea } from '../data/karachiAreas';
import { MAJOR_CITIES } from '../data/pakistanLocations';
import { RoutePoint } from '../types/map';
import { 
  MapPin, 
  Search, 
  X, 
  Compass, 
  Check, 
  Navigation, 
  Building2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface KarachiTownSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (point: RoutePoint) => void;
  currentCityName?: string;
}

export function KarachiTownSelectorModal({
  isOpen,
  onClose,
  onSelectLocation,
  currentCityName = 'Karachi',
}: KarachiTownSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<'karachi' | 'cities'>('karachi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('All');

  if (!isOpen) return null;

  const zones = ['All', 'South Karachi', 'East Karachi', 'Central Karachi', 'Korangi', 'Super Highway'];

  const filteredKarachiAreas = KARACHI_AREAS.filter(area => {
    const matchesSearch =
      area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (area.urduName && area.urduName.includes(searchQuery)) ||
      area.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.popularSpots.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesZone = selectedZone === 'All' || area.zone === selectedZone;

    return matchesSearch && matchesZone;
  });

  const filteredCities = MAJOR_CITIES.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.urduName && c.urduName.includes(searchQuery)) ||
      (c.province && c.province.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              🏙️
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Select Your City & Area in Pakistan
              </h3>
              <p className="text-xs text-emerald-400">
                Karachi Town & Neighborhood High-Detail Switcher
              </p>
            </div>
          </div>

          <button
            id="close-town-selector-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 border-b border-neutral-800 flex items-center gap-2 bg-neutral-950/30">
          <button
            id="tab-karachi-areas"
            onClick={() => setActiveTab('karachi')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'karachi'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>🌊 Karachi Areas & Towns ({KARACHI_AREAS.length})</span>
          </button>

          <button
            id="tab-all-pakistan-cities"
            onClick={() => setActiveTab('cities')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cities'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>🇵🇰 All Pakistan Cities ({MAJOR_CITIES.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'karachi'
                  ? 'Search Clifton, DHA, Gulshan, Saddar, Johar, PECHS, Nazimabad...'
                  : 'Search Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan...'
              }
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Zone filter chips for Karachi */}
          {activeTab === 'karachi' && (
            <div className="flex items-center gap-1.5 overflow-x-auto mt-2.5 pb-1 no-scrollbar">
              {zones.map(z => (
                <button
                  key={z}
                  onClick={() => setSelectedZone(z)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                    selectedZone === z
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Areas / Cities List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeTab === 'karachi' ? (
            filteredKarachiAreas.length > 0 ? (
              filteredKarachiAreas.map(area => (
                <button
                  key={area.id}
                  id={`select-karachi-area-${area.id}`}
                  onClick={() => {
                    onSelectLocation(area);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl bg-neutral-950/70 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-emerald-500/50 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-600/30 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {area.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded">
                          {area.zone}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                        {area.address}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {area.popularSpots.slice(0, 3).map(spot => (
                          <span
                            key={spot}
                            className="text-[10px] bg-neutral-900 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-800"
                          >
                            {spot}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-2" />
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-neutral-400">
                No Karachi areas found matching &quot;{searchQuery}&quot;.
              </div>
            )
          ) : (
            filteredCities.map(city => (
              <button
                key={city.id}
                id={`select-city-btn-${city.id}`}
                onClick={() => {
                  onSelectLocation(city);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl bg-neutral-950/70 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center font-bold text-xs">
                    📍
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{city.name}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">{city.province}</span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
