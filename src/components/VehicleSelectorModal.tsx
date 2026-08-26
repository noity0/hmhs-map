import React, { useState } from 'react';
import { VehicleProfile } from '../types/map';
import { POPULAR_VEHICLES } from '../data/vehicles';
import { 
  Truck, 
  Car, 
  Bike, 
  X, 
  Plus, 
  Check, 
  ShieldAlert, 
  Zap, 
  Gauge, 
  Maximize2,
  Sparkles
} from 'lucide-react';

interface VehicleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: VehicleProfile | null;
  onSelectVehicle: (vehicle: VehicleProfile | null) => void;
}

export function VehicleSelectorModal({
  isOpen,
  onClose,
  selectedVehicle,
  onSelectVehicle,
}: VehicleSelectorModalProps) {
  const [customVehicles, setCustomVehicles] = useState<VehicleProfile[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<VehicleProfile['category']>('car');
  const [customSpeed, setCustomSpeed] = useState('90');
  const [customWidth, setCustomWidth] = useState('1.8');

  if (!isOpen) return null;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const speed = parseInt(customSpeed, 10) || 80;
    const width = parseFloat(customWidth) || 1.8;

    const getIcon = (cat: string) => {
      if (cat === 'motorcycle') return '🏍️';
      if (cat === 'scooter') return '🛵';
      if (cat === 'truck') return '🚛';
      if (cat === 'rickshaw') return '🛺';
      if (cat === 'suv') return '🚙';
      if (cat === 'pickup') return '🛻';
      if (cat === 'van') return '🚐';
      if (cat === 'emergency') return '🚑';
      if (cat === 'ev') return '🔋';
      return '🚗';
    };

    const newVehicle: VehicleProfile = {
      id: `custom-veh-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      maxSpeedKmh: speed,
      citySpeedKmh: Math.round(speed * 0.45),
      highwaySpeedKmh: speed,
      widthMeters: width,
      icon: getIcon(customCategory),
      avoidNarrowGullies: width > 2.2,
      motorwayAllowed: customCategory !== 'rickshaw' && customCategory !== 'bicycle' && customCategory !== 'motorcycle' && customCategory !== 'scooter',
      notes: `Custom Vehicle: ${customName} (${speed} km/h max speed, ${width}m width)`,
    };

    setCustomVehicles(prev => [newVehicle, ...prev]);
    onSelectVehicle(newVehicle);
    setCustomName('');
    setIsAddingCustom(false);
  };

  const allVehicles = [...customVehicles, ...POPULAR_VEHICLES];
  const filteredVehicles = activeCategory === 'all' 
    ? allVehicles 
    : allVehicles.filter(v => v.category === activeCategory || (activeCategory === 'car' && (v.category === 'car' || v.category === 'ev')));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-base shadow-md">
              🚗
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Select Vehicle for Smart Routing
              </h3>
              <p className="text-[11px] text-emerald-400">
                Speed, clearance, and corridor routing matched to your vehicle
              </p>
            </div>
          </div>

          <button
            id="close-vehicle-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Default / No Vehicle option */}
          <button
            id="select-standard-routing"
            onClick={() => {
              onSelectVehicle(null);
              onClose();
            }}
            className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
              !selectedVehicle
                ? 'bg-emerald-950/40 border-emerald-500/70 text-white'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-lg">
                🌐
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  Standard Universal Routing (Default)
                </div>
                <div className="text-[11px] text-neutral-400">
                  Calculates general fastest highway & city street routes
                </div>
              </div>
            </div>
            {!selectedVehicle && <Check className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Toggle Custom Vehicle Creator */}
          {!isAddingCustom ? (
            <button
              id="btn-add-custom-vehicle"
              onClick={() => setIsAddingCustom(true)}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-600/50 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Your Custom Vehicle (Name, Speed & Size)</span>
            </button>
          ) : (
            <form onSubmit={handleAddCustom} className="p-3.5 rounded-xl bg-neutral-950 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Custom Vehicle Setup
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Vehicle Name / Model</label>
                <input
                  type="text"
                  placeholder="e.g. My Yamaha YBR, Suzuki Cultus, Hino Mazda"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="car">🚗 Car</option>
                    <option value="motorcycle">🏍️ Motorcycle</option>
                    <option value="suv">🚙 SUV / 4x4</option>
                    <option value="truck">🚛 Heavy Truck</option>
                    <option value="rickshaw">🛺 Rickshaw</option>
                    <option value="bus">🚌 Bus</option>
                    <option value="bicycle">🚲 Cycle</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Max Speed (km/h)</label>
                  <input
                    type="number"
                    value={customSpeed}
                    onChange={e => setCustomSpeed(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    min="15"
                    max="200"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Width (meters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customWidth}
                    onChange={e => setCustomWidth(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    min="0.5"
                    max="3.5"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors"
              >
                Save & Use Custom Vehicle
              </button>
            </form>
          )}

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'all', label: 'All', icon: '🌐' },
              { id: 'car', label: 'Cars', icon: '🚗' },
              { id: 'motorcycle', label: 'Bikes', icon: '🏍️' },
              { id: 'scooter', label: 'Scooters', icon: '🛵' },
              { id: 'suv', label: 'SUVs & Pickups', icon: '🚙' },
              { id: 'truck', label: 'Trucks', icon: '🚛' },
              { id: 'van', label: 'Vans', icon: '🚐' },
              { id: 'emergency', label: 'Emergency', icon: '🚑' },
              { id: 'rickshaw', label: 'Rickshaws', icon: '🛺' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-1 px-2.5 rounded-lg border text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Vehicle List */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Select Vehicle Profile ({filteredVehicles.length})</span>
            </div>

            {filteredVehicles.map(veh => {
              const isSelected = selectedVehicle?.id === veh.id;
              return (
                <button
                  key={veh.id}
                  id={`select-vehicle-${veh.id}`}
                  onClick={() => {
                    onSelectVehicle(veh);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800/90 border border-neutral-700/60 flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
                      {veh.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{veh.name}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-neutral-400">
                        <span className="flex items-center gap-1 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          <Gauge className="w-2.5 h-2.5 text-blue-400" />
                          {veh.citySpeedKmh}-{veh.highwaySpeedKmh} km/h
                        </span>
                        <span className="flex items-center gap-1 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          <Maximize2 className="w-2.5 h-2.5 text-amber-400" />
                          {veh.widthMeters}m width
                        </span>
                        {veh.avoidNarrowGullies && (
                          <span className="flex items-center gap-1 bg-red-950/50 text-red-400 px-1.5 py-0.5 rounded border border-red-800/40">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            Heavy Bypass
                          </span>
                        )}
                        {(veh.category === 'motorcycle' || veh.category === 'scooter') && (
                          <span className="flex items-center gap-1 bg-emerald-950/50 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/40">
                            <Zap className="w-2.5 h-2.5" />
                            Gully Shortcuts
                          </span>
                        )}
                      </div>

                      {veh.notes && (
                        <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1">{veh.notes}</p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
