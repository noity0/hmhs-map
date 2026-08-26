import React, { useState } from 'react';
import { TrafficIncident } from '../types/map';
import { 
  Flame, 
  AlertTriangle, 
  Construction, 
  ShieldAlert, 
  CloudRain, 
  Car, 
  Plus, 
  X, 
  MapPin, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface TrafficIncidentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: TrafficIncident[];
  onAddIncident: (incident: TrafficIncident) => void;
  onFocusIncident: (incident: TrafficIncident) => void;
}

export function TrafficIncidentsModal({
  isOpen,
  onClose,
  incidents,
  onAddIncident,
  onFocusIncident,
}: TrafficIncidentsModalProps) {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [isReporting, setIsReporting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('Karachi');
  const [locationName, setLocationName] = useState('');
  const [type, setType] = useState<TrafficIncident['type']>('congestion');
  const [severity, setSeverity] = useState<TrafficIncident['severity']>('high');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const filteredIncidents = selectedCity === 'All'
    ? incidents
    : incidents.filter(inc => inc.city.toLowerCase().includes(selectedCity.toLowerCase()));

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !locationName) return;

    // Center coordinates estimation for reporting
    const cityCoords: Record<string, [number, number]> = {
      Karachi: [24.8607, 67.0011],
      Lahore: [31.5497, 74.3436],
      Islamabad: [33.6844, 73.0479],
      Rawalpindi: [33.5973, 73.0479],
      Peshawar: [34.0151, 71.5249],
      Quetta: [30.1798, 66.9750],
      Multan: [30.1575, 71.5249],
    };

    const baseCoord = cityCoords[city] || [31.5497, 74.3436];
    const randomizedCoord: [number, number] = [
      baseCoord[0] + (Math.random() - 0.5) * 0.04,
      baseCoord[1] + (Math.random() - 0.5) * 0.04,
    ];

    const newIncident: TrafficIncident = {
      id: `user-inc-${Date.now()}`,
      title,
      city,
      locationName,
      type,
      severity,
      description,
      coordinates: randomizedCoord,
      reportedAt: 'Just now',
      verifiedCount: 1,
    };

    onAddIncident(newIncident);
    setIsReporting(false);
    setTitle('');
    setLocationName('');
    setDescription('');
  };

  const getIncidentIcon = (t: TrafficIncident['type']) => {
    switch (t) {
      case 'construction':
        return <Construction className="w-4 h-4 text-amber-400" />;
      case 'accident':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'naka':
        return <ShieldAlert className="w-4 h-4 text-blue-400" />;
      case 'rain_water':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      default:
        return <Flame className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <div
      id="traffic-incidents-modal-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="traffic-incidents-modal"
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Pakistan Live Traffic & Chokepoints
              </h2>
              <p className="text-xs text-neutral-400">
                Real-time congestion, roadblocks, police nakas & motorway alerts
              </p>
            </div>
          </div>

          <button
            id="close-traffic-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar & Report CTA */}
        <div className="px-4 sm:px-5 py-3 bg-neutral-950/50 border-b border-neutral-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5">
            {['All', 'Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Motorway M-2'].map(c => (
              <button
                key={c}
                id={`city-filter-${c}`}
                onClick={() => setSelectedCity(c)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  selectedCity === c
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            id="report-traffic-incident-btn"
            onClick={() => setIsReporting(!isReporting)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 flex-shrink-0 shadow-md transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            {isReporting ? 'Cancel Report' : 'Report Traffic Issue'}
          </button>
        </div>

        {/* Reporting Form or Incident List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {isReporting ? (
            <form onSubmit={handleReportSubmit} className="flex flex-col gap-3 bg-neutral-950/80 p-4 rounded-xl border border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Report Traffic Incident / Roadblock in Pakistan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Issue Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Heavy Jam near Kalma Chowk"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">City / Highway</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad / Rawalpindi</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                    <option value="Motorway M-2">Motorway M-2 / M-1</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Specific Location / Chowk / Gully</label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    placeholder="e.g. Near Sharea Faisal FTC Flyover"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Incident Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="congestion">Traffic Congestion / Jam</option>
                    <option value="construction">Road Maintenance / Digging</option>
                    <option value="accident">Accident / Breakdown</option>
                    <option value="naka">Police Checking / Naka</option>
                    <option value="rain_water">Monsoon Rain Waterlogging</option>
                  </select>
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-neutral-400 font-medium mb-1">Details & Alternate Route Suggestion</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Right lane blocked, use service road instead."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 mt-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Broadcast Incident to Pakistan Map
              </button>
            </form>
          ) : (
            filteredIncidents.map(inc => (
              <div
                key={inc.id}
                id={`incident-card-${inc.id}`}
                className="p-3.5 sm:p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-orange-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getIncidentIcon(inc.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                        {inc.title}
                      </h4>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      {inc.locationName} • <span className="text-orange-400">{inc.city}</span>
                    </p>
                    <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">{inc.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {inc.reportedAt}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        ✓ {inc.verifiedCount} drivers verified
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id={`focus-incident-${inc.id}-btn`}
                  onClick={() => {
                    onFocusIncident(inc);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-1 self-start sm:self-center transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-400" /> View on Map
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
