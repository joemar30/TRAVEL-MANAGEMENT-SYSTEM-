import { useState, useEffect, useRef } from 'react';
import { useTravelStore, BookingType } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Plane,
  Hotel,
  Car,
  MapPin,
  Plus,
  X,
  Save,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  ArrowRight,
  PlaneLanding,
  PlaneTakeoff,
  Radio,
  Maximize2,
  Navigation,
  Wind,
  Cloud,
  Timer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ──── Live Flight Status Data ────
type FlightStatus = 'on-time' | 'boarding' | 'departed' | 'landed' | 'delayed' | 'gate-change';

interface FlightUpdate {
  id: string;
  flight: string;
  airline: string;
  origin: string;
  originCode: string;
  destination: string;
  destCode: string;
  status: FlightStatus;
  scheduledTime: string;
  gate: string;
  terminal: string;
  remark?: string;
  timestamp: number;
}

const AIRLINES = ['Philippine Airlines', 'Cebu Pacific', 'AirAsia', 'Singapore Airlines', 'Cathay Pacific', 'Japan Airlines', 'Korean Air', 'Emirates', 'Qatar Airways', 'EVA Air'];
const ROUTES = [
  { origin: 'Manila', originCode: 'MNL', destination: 'Tokyo Narita', destCode: 'NRT' },
  { origin: 'Tokyo Haneda', originCode: 'HND', destination: 'Manila', destCode: 'MNL' },
  { origin: 'Singapore', originCode: 'SIN', destination: 'Manila', destCode: 'MNL' },
  { origin: 'Manila', originCode: 'MNL', destination: 'Seoul Incheon', destCode: 'ICN' },
  { origin: 'Dubai', originCode: 'DXB', destination: 'Manila', destCode: 'MNL' },
  { origin: 'Hong Kong', originCode: 'HKG', destination: 'Manila', destCode: 'MNL' },
  { origin: 'Manila', originCode: 'MNL', destination: 'Cebu', destCode: 'CEB' },
  { origin: 'Cebu', originCode: 'CEB', destination: 'Manila', destCode: 'MNL' },
  { origin: 'Los Angeles', originCode: 'LAX', destination: 'Manila', destCode: 'MNL' },
  { origin: 'Doha', originCode: 'DOH', destination: 'Manila', destCode: 'MNL' },
  { origin: 'Manila', originCode: 'MNL', destination: 'Bangkok', destCode: 'BKK' },
  { origin: 'Taipei', originCode: 'TPE', destination: 'Manila', destCode: 'MNL' },
  { origin: 'Manila', originCode: 'MNL', destination: 'Osaka', destCode: 'KIX' },
  { origin: 'Kuala Lumpur', originCode: 'KUL', destination: 'Manila', destCode: 'MNL' },
];

const CURRENCY_SYMBOLS = {
  'PHP': '₱',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'KRW': '₩',
  'SGD': 'S$',
  'BTC': '₿',
};
const STATUSES: FlightStatus[] = ['on-time', 'boarding', 'departed', 'landed', 'delayed', 'gate-change'];
const GATES = ['A1', 'A3', 'A7', 'B2', 'B5', 'B9', 'C1', 'C4', 'D2', 'D6', 'E1', 'E3'];
const TERMINALS = ['T1', 'T2', 'T3', 'T4'];

// ──── Location & Hotel Suggestions Data ────
const COMMON_LOCATIONS = [
  "Amsterdam, Netherlands", "Athens, Greece", "Abu Dhabi, UAE", "Barcelona, Spain", "Berlin, Germany", 
  "Bangkok, Thailand", "Brussels, Belgium", "Cairo, Egypt", "Cape Town, South Africa", "Chicago, USA", 
  "Copenhagen, Denmark", "Cebu City, Philippines", "Davao, Philippines", "Delhi, India", "Dubai, UAE", 
  "Dublin, Ireland", "Edinburgh, Scotland", "Florence, Italy", "Frankfurt, Germany", "Hong Kong, China", 
  "Istanbul, Turkey", "Jakarta, Indonesia", "Johannesburg, South Africa", "Kuala Lumpur, Malaysia", 
  "Las Vegas, USA", "Lisbon, Portugal", "London, UK", "Los Angeles, USA", "Madrid, Spain", 
  "Manila, Philippines", "Melbourne, Australia", "Mexico City, Mexico", "Miami, USA", "Milan, Italy", 
  "Moscow, Russia", "Mumbai, India", "Munich, Germany", "New York, USA", "Nice, France", 
  "Osaka, Japan", "Oslo, Norway", "Paris, France", "Prague, Czech Republic", "Rio de Janeiro, Brazil", 
  "Rome, Italy", "San Francisco, USA", "Sao Paulo, Brazil", "Seoul, South Korea", "Shanghai, China", 
  "Singapore", "Stockholm, Sweden", "Sydney, Australia", "Taipei, Taiwan", "Tel Aviv, Israel", 
  "Tokyo, Japan", "Toronto, Canada", "Vancouver, Canada", "Venice, Italy", "Vienna, Austria", 
  "Warsaw, Poland", "Washington DC, USA", "Zurich, Switzerland", "Palawan, Philippines", 
  "Boracay, Philippines", "Siargao, Philippines", "Baguio, Philippines", "Vigan, Philippines",
  "Hilton Hotels", "Marriott International", "Sheraton Hotels", "Hyatt Regency", "Shangri-La Hotels",
  "InterContinental Hotels", "Four Seasons Hotels", "Radisson Blu", "Novotel Hotels", "Holiday Inn",
  "The Ritz-Carlton", "Westin Hotels", "Sofitel Luxury Hotels", "W Hotels Worldwide", "Grand Hyatt",
  "Park Hyatt", "Aman Resorts", "Rosewood Hotels", "Fairmont Hotels", "St. Regis", "Pullman Hotels"
];

function generateFlightCode(airline: string): string {
  const prefixes: Record<string, string> = {
    'Philippine Airlines': 'PR', 'Cebu Pacific': '5J', 'AirAsia': 'Z2',
    'Singapore Airlines': 'SQ', 'Cathay Pacific': 'CX', 'Japan Airlines': 'JL',
    'Korean Air': 'KE', 'Emirates': 'EK', 'Qatar Airways': 'QR', 'EVA Air': 'BR',
  };
  return `${prefixes[airline] || 'XX'}${Math.floor(100 + Math.random() * 900)}`;
}

function generateRandomTime(): string {
  const h = Math.floor(Math.random() * 24);
  const m = Math.floor(Math.random() * 6) * 10;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function generateFlight(): FlightUpdate {
  const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
  const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const gate = GATES[Math.floor(Math.random() * GATES.length)];
  const terminal = TERMINALS[Math.floor(Math.random() * TERMINALS.length)];
  const remarks: Partial<Record<FlightStatus, string>> = {
    'delayed': `Delayed ~${15 + Math.floor(Math.random() * 45)} min`,
    'gate-change': `Moved to Gate ${GATES[Math.floor(Math.random() * GATES.length)]}`,
    'boarding': 'Final boarding call',
    'landed': 'Arrived at gate',
  };
  return {
    id: `fl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    flight: generateFlightCode(airline),
    airline,
    origin: route.origin,
    originCode: route.originCode,
    destination: route.destination,
    destCode: route.destCode,
    status,
    scheduledTime: generateRandomTime(),
    gate,
    terminal,
    remark: remarks[status],
    timestamp: Date.now(),
  };
}

// ──── Flight Tracker Component ────
function FlightTracker({ onPlayback }: { onPlayback: (flight: FlightUpdate) => void }) {
  const [flights, setFlights] = useState<FlightUpdate[]>(() =>
    Array.from({ length: 6 }, () => generateFlight())
  );
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlights((prev) => {
        const newFlight = generateFlight();
        return [newFlight, ...prev].slice(0, 12);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [flights.length]);

  const getStatusStyle = (status: FlightStatus) => {
    switch (status) {
      case 'on-time': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', label: 'On Time' };
      case 'boarding': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Boarding' };
      case 'departed': return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500', label: 'Departed' };
      case 'landed': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Landed' };
      case 'delayed': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Delayed' };
      case 'gate-change': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Gate Change' };
    }
  };

  const getStatusIcon = (status: FlightStatus) => {
    switch (status) {
      case 'landed': return <PlaneLanding className="w-4 h-4" />;
      case 'departed': return <PlaneTakeoff className="w-4 h-4" />;
      case 'boarding': return <Plane className="w-4 h-4" />;
      default: return <Plane className="w-4 h-4" />;
    }
  };

  const secondsAgo = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-4 h-4 text-green-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide" style={{ fontFamily: 'Syne' }}>
            Live Flight Status
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-green-400 font-mono uppercase tracking-widest">
            Live
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Flight Feed */}
      <div ref={feedRef} className="max-h-[320px] overflow-y-auto divide-y divide-border">
        {flights.map((flight, index) => {
          const style = getStatusStyle(flight.status);
          const isNew = index === 0 && (Date.now() - flight.timestamp) < 6000;
          return (
            <div
              key={flight.id}
              onClick={() => onPlayback(flight)}
              className={`px-5 py-4 transition-all duration-500 cursor-pointer group relative ${
                isNew ? 'bg-yellow-50/50' : 'bg-card hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Flight Icon & Code */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${style.bg} ${style.text}`}>
                  {getStatusIcon(flight.status)}
                </div>

                {/* Route */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground font-mono">{flight.flight}</span>
                    <span className="text-xs text-muted-foreground truncate opacity-70">{flight.airline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-semibold text-foreground tracking-wider">{flight.originCode}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground tracking-wider">{flight.destCode}</span>
                    <span className="text-xs text-muted-foreground ml-1 font-medium">• {flight.scheduledTime}</span>
                    <span className="text-xs text-muted-foreground font-medium">• Gate {flight.gate}</span>
                  </div>
                </div>

                {/* Status & Timestamp */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${flight.status === 'boarding' || flight.status === 'delayed' ? 'animate-pulse' : ''}`} />
                    {style.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {secondsAgo(flight.timestamp)}
                    </span>
                    <Maximize2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              {/* Remark */}
              {flight.remark && (
                <p className="text-[11px] text-muted-foreground mt-2 ml-14 italic flex items-center gap-1.5">
                  <span className="w-1 h-3 bg-border rounded-full" />
                  {flight.remark}
                </p>
              )}

              {/* Hover Instructions */}
              <div className="absolute right-5 bottom-2 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
                <span className="text-[9px] uppercase tracking-tighter font-bold">Click for Playback</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-border bg-gray-50/50 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
          System: Active • {flights.length} updates
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          Auto-refreshing 5s
        </span>
      </div>
    </div>
  );
}

// ──── Playback Immersive Modal ────
function PlaybackModal({ flight, onClose }: { flight: FlightUpdate, onClose: () => void }) {
  const [progress, setProgress] = useState(0);
  const [altitude, setAltitude] = useState(32000);
  const [speed, setSpeed] = useState(840);

  useEffect(() => {
    // Initial random state
    setProgress(20 + Math.random() * 60);
    setAltitude(30000 + Math.floor(Math.random() * 8000));
    setSpeed(820 + Math.floor(Math.random() * 60));

    const interval = setInterval(() => {
      setProgress(p => Math.min(100, p + 0.1));
      setAltitude(a => a + (Math.random() > 0.5 ? 100 : -100));
      setSpeed(s => s + (Math.random() > 0.5 ? 2 : -2));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-widest uppercase" style={{ fontFamily: 'Syne' }}>
                {flight.flight} Playback
              </h2>
              <p className="text-xs text-gray-400 font-mono tracking-wide">
                {flight.airline} • {flight.status.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Radar View */}
        <div className="p-8 pb-0">
          <div className="relative h-64 bg-black/60 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex items-center justify-center">
               {[1, 2, 3].map(i => (
                 <div key={i} className="absolute border border-white/[0.03] rounded-full" style={{ width: i * 200, height: i * 200 }} />
               ))}
               <div className="absolute w-px h-full bg-white/[0.03]" />
               <div className="absolute w-full h-px bg-white/[0.03]" />
            </div>

            {/* Flight Path Line */}
            <div className="relative w-3/4 h-1 bg-white/10 rounded-full flex items-center">
              {/* Origin */}
              <div className="absolute -left-2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-white border-4 border-gray-900 shadow-[0_0_15px_white]" />
                <span className="mt-2 text-xs font-bold text-white font-mono">{flight.originCode}</span>
              </div>

              {/* Destination */}
              <div className="absolute -right-2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full border-2 border-white/40" />
                <span className="mt-2 text-xs font-bold text-white font-mono">{flight.destCode}</span>
              </div>

              {/* Progress Line */}
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-white"
                style={{ width: `${progress}%` }}
              />

              {/* Animated Plane */}
              <motion.div
                className="absolute"
                style={{ left: `calc(${progress}% - 20px)` }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative">
                   <div className="absolute inset-0 bg-blue-400/30 blur-xl rounded-full scale-150" />
                   <Navigation className="w-10 h-10 text-white fill-white rotate-90 drop-shadow-[0_0_8px_white]" />
                </div>
              </motion.div>
            </div>

            {/* Scanning Radar Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/0 via-blue-500/0 to-blue-500/10 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400">
               <Navigation className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Altitude</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {altitude.toLocaleString()}<span className="text-xs text-gray-500 ml-1">FT</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400">
               <Wind className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Airspeed</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {speed}<span className="text-xs text-gray-500 ml-1">MPH</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400">
               <Timer className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-400 font-mono">
              {progress.toFixed(1)}<span className="text-xs text-blue-800/80 ml-1">%</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400">
               <Cloud className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Status</span>
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-tighter">
              {flight.status.replace('-', ' ')}
            </p>
            <p className="text-[10px] text-gray-500 font-mono">GATE {flight.gate} • {flight.terminal}</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-8 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Telemetry Active</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono">
            {flight.airline} INTL • {new Date().toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ──── Booking Form Types ────
interface BookingRequestForm {
  type: BookingType;
  name: string;
  route: string;
  property: string;
  startDate: string;
  endDate: string;
  price: string;
  notes: string;
  tripId: string;
}

const emptyForm: BookingRequestForm = {
  type: 'flight',
  name: '',
  route: '',
  property: '',
  startDate: '',
  endDate: '',
  price: '',
  notes: '',
  tripId: '',
};

function LocationSuggestions({ searchTerm, onSelect }: { searchTerm: string; onSelect: (val: string) => void }) {
  const filtered = COMMON_LOCATIONS.filter(city => 
    city.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  if (!searchTerm || filtered.length === 0) return null;

  return (
    <div className="absolute z-[100] w-full mt-1 bg-white border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      {filtered.map((city) => (
        <button
          key={city}
          onClick={() => onSelect(city)}
          className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-50 flex items-center gap-3 transition-colors border-b border-zinc-50 last:border-0"
        >
          <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-zinc-500" />
          </div>
          <span className="font-medium text-foreground">{city}</span>
        </button>
      ))}
    </div>
  );
}

function RouteSuggestions({ searchTerm, onSelect }: { searchTerm: string; onSelect: (val: string) => void }) {
  if (!searchTerm || searchTerm.length < 2) return null;
  
  const searchLower = searchTerm.toLowerCase();
  
  const keywordMatch = (r: typeof ROUTES[0]) => {
    const keywords = [r.origin, r.originCode, r.destination, r.destCode].map(s => s.toLowerCase());
    
    // Country shorthands manually added for autocomplete testing
    if (['jpn', 'japan', 'tokyo', 'osaka'].includes(searchLower)) {
      if (keywords.includes('nrt') || keywords.includes('hnd') || keywords.includes('kix') || keywords.includes('tokyo haneda') || keywords.includes('tokyo narita') || keywords.includes('osaka')) return true;
    }
    if (['ph', 'phl', 'philippines', 'manila', 'cebu'].includes(searchLower)) {
      if (keywords.includes('mnl') || keywords.includes('ceb') || keywords.includes('manila') || keywords.includes('cebu')) return true;
    }
    if (['sg', 'sgp', 'singapore'].includes(searchLower)) {
      if (keywords.includes('sin') || keywords.includes('singapore')) return true;
    }
    if (['ae', 'uae', 'dubai'].includes(searchLower)) {
      if (keywords.includes('dxb') || keywords.includes('dubai')) return true;
    }
    if (['kr', 'kor', 'korea', 'seoul'].includes(searchLower)) {
      if (keywords.includes('icn') || keywords.includes('seoul incheon')) return true;
    }
    return keywords.some(k => k.includes(searchLower));
  };
  
  const filtered = ROUTES.filter(keywordMatch).slice(0, 5);

  if (filtered.length === 0) return null;

  return (
    <div className="absolute z-[100] w-full mt-1 bg-white border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      {filtered.map((r, i) => {
        const routeLabel = `${r.originCode} → ${r.destCode}`;
        const routeFull = `${r.origin} to ${r.destination}`;
        return (
          <button
            key={i}
            onClick={() => onSelect(routeLabel)}
            className="w-full px-4 py-3 text-left hover:bg-zinc-50 flex items-center gap-3 transition-colors border-b border-zinc-50 last:border-0"
          >
            <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
              <span className="block font-bold text-foreground text-sm">{routeLabel}</span>
              <span className="block text-xs text-muted-foreground">{routeFull}</span>
            </div>
          </button>
        )
      })}
    </div>
  );
}

import { ApprovalTracker } from '@/components/ApprovalTracker';

export default function ClientBookings() {
  const { bookings, trips, addBooking, user } = useTravelStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<BookingRequestForm>(emptyForm);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [playbackFlight, setPlaybackFlight] = useState<FlightUpdate | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHotelMap, setShowHotelMap] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<string | null>(null);
  const [trackingBookingId, setTrackingBookingId] = useState<string | null>(null);

  // Backend already filters bookings by user_id for clients, returns all for admin
  const myBookings = bookings;

  const filteredBookings = myBookings.filter((b) => {
    if (activeFilter === 'all') return true;
    return b.status === activeFilter;
  });

  const pendingCount = myBookings.filter((b) => b.status === 'in-review' || b.status === 'pending').length;
  const confirmedCount = myBookings.filter((b) => b.status === 'confirmed').length;
  const cancelledCount = myBookings.filter((b) => b.status === 'cancelled').length;

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'in-review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            <AlertCircle className="w-3 h-3" />
            Under Review
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate) {
      toast.error('Please fill in travel dates');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      toast.error('Please enter a valid estimated price');
      return;
    }
    if (form.type === 'hotel' && !form.property.trim()) {
      toast.error('Please enter a hotel/property name');
      return;
    }
    if (form.type !== 'hotel' && !form.name.trim()) {
      toast.error('Please enter a destination name');
      return;
    }

    try {
      setLoading(true);
      await addBooking({
        type: form.type,
        name: form.type !== 'hotel' ? form.name.trim() : undefined,
        route: form.type === 'flight' ? form.route.trim() : undefined,
        property: form.type === 'hotel' ? form.property.trim() : undefined,
        dates: { start: form.startDate, end: form.endDate },
        price: Number(form.price),
        status: 'in-review',
        notes: form.notes.trim() || undefined,
        tripId: form.tripId || undefined,
      });

      toast.success(
        'Booking request submitted! An admin will review your reservation shortly.',
        { duration: 4000 }
      );
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error('Failed to submit booking request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-5 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">
            {myBookings.length} booking{myBookings.length !== 1 ? 's' : ''}
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3" />{pendingCount} awaiting review
              </span>
            )}
          </p>
        </div>
        {/* Desktop button — hidden on mobile (FAB below) */}
        <Button
          onClick={() => { setForm(emptyForm); setShowModal(true); }}
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 text-white shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          New Reservation
        </Button>
      </div>

      {/* ──── Professional Filter Bar ──── */}
      <div className="bg-card border border-border rounded-2xl p-1.5 shadow-sm">
        {/* Mobile: 2-col grid, Desktop: single row */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-1">
          {[
            {
              key: 'all',
              label: 'All',
              count: myBookings.length,
              icon: <MapPin className="w-3.5 h-3.5" />,
              activeClass: 'bg-gray-900 text-white shadow-md shadow-black/20',
              inactiveClass: 'text-muted-foreground hover:bg-gray-100 hover:text-foreground',
              badgeClass: 'bg-white/20 text-white',
              inactiveBadgeClass: 'bg-gray-100 text-gray-500',
            },
            {
              key: 'in-review',
              label: 'Under Review',
              count: myBookings.filter(b => b.status === 'in-review').length,
              icon: <AlertCircle className="w-3.5 h-3.5" />,
              activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-500/30',
              inactiveClass: 'text-blue-700 hover:bg-blue-50',
              badgeClass: 'bg-white/25 text-white',
              inactiveBadgeClass: 'bg-blue-100 text-blue-600',
            },
            {
              key: 'pending',
              label: 'Pending',
              count: myBookings.filter(b => b.status === 'pending').length,
              icon: <Clock className="w-3.5 h-3.5" />,
              activeClass: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
              inactiveClass: 'text-amber-700 hover:bg-amber-50',
              badgeClass: 'bg-white/25 text-white',
              inactiveBadgeClass: 'bg-amber-100 text-amber-600',
            },
            {
              key: 'confirmed',
              label: 'Confirmed',
              count: confirmedCount,
              icon: <CheckCircle2 className="w-3.5 h-3.5" />,
              activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30',
              inactiveClass: 'text-emerald-700 hover:bg-emerald-50',
              badgeClass: 'bg-white/25 text-white',
              inactiveBadgeClass: 'bg-emerald-100 text-emerald-600',
            },
            {
              key: 'cancelled',
              label: 'Cancelled',
              count: cancelledCount,
              icon: <XCircle className="w-3.5 h-3.5" />,
              activeClass: 'bg-red-600 text-white shadow-md shadow-red-500/30',
              inactiveClass: 'text-red-700 hover:bg-red-50',
              badgeClass: 'bg-white/25 text-white',
              inactiveBadgeClass: 'bg-red-100 text-red-600',
            },
          ].map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 select-none ${
                  isActive ? tab.activeClass : tab.inactiveClass
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                <span
                  className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center transition-all ${
                    isActive ? tab.badgeClass : tab.inactiveBadgeClass
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──── Live Flight Status Tracker ──── */}
      <FlightTracker onPlayback={(f) => setPlaybackFlight(f)} />

      {/* ──── Immersive Playback Modal ──── */}
      <AnimatePresence>
        {playbackFlight && (
          <PlaybackModal
            flight={playbackFlight}
            onClose={() => setPlaybackFlight(null)}
          />
        )}
      </AnimatePresence>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'in-review' ? 'bg-blue-100 text-blue-700' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {getBookingIcon(booking.type)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                        {booking.name || booking.property}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="capitalize">{booking.type}</span>
                        {booking.route && (
                          <>
                            <span>•</span>
                            <span>{booking.route}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-foreground">${booking.price.toLocaleString()}</p>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Date & Trip info */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(booking.dates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {booking.dates.start !== booking.dates.end && (
                        <> — {new Date(booking.dates.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                      )}
                    </span>
                    {booking.tripId && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {trips.find(t => t.id === booking.tripId)?.destination || 'Trip'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <p className="mt-2 text-sm text-muted-foreground bg-gray-50 rounded px-3 py-2 border border-gray-100">
                      <span className="font-medium text-foreground">Note:</span> {booking.notes}
                    </p>
                  )}

                  {/* Tracking Button */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTrackingBookingId(booking.id)}
                      className="h-8 text-[11px] font-bold uppercase tracking-widest border-black hover:bg-black hover:text-white transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5 mr-2" />
                      Track Status
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Syne' }}>
              {activeFilter === 'all' ? 'No Bookings Yet' : `No ${activeFilter} bookings`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {activeFilter === 'all'
                ? 'Submit your first reservation request to get started!'
                : 'Try a different filter or submit a new reservation.'}
            </p>
            {activeFilter === 'all' && (
              <Button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="bg-black hover:bg-gray-900 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Reservation
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ──── Tracking Modal ──── */}
      {trackingBookingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="bg-white border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
           >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
                 <h2 className="text-xl font-bold text-zinc-900 uppercase" style={{ fontFamily: 'Syne' }}>Reservation Tracker</h2>
                 <Button variant="ghost" size="sm" onClick={() => setTrackingBookingId(null)}>
                    <X className="w-5 h-5" />
                 </Button>
              </div>
              <div className="p-6">
                 {(() => {
                    const booking = bookings.find(b => b.id === trackingBookingId);
                    return booking ? <ApprovalTracker booking={booking} /> : null;
                 })()}
              </div>
           </motion.div>
        </div>
      )}

      {/* ──── New Reservation Modal ──── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                  New Reservation
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill in the details and submit for admin approval
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Booking Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">What do you need?</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { type: 'flight' as BookingType, icon: Plane, label: 'Flight' },
                    { type: 'hotel' as BookingType, icon: Hotel, label: 'Hotel' },
                    { type: 'car' as BookingType, icon: Car, label: 'Car Rental' },
                  ]).map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, type })}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        form.type === type
                          ? 'border-black bg-black text-white'
                          : 'border-border hover:border-black/30 text-foreground'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Fields */}
              {form.type === 'hotel' ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Hotel / Property Name</label>
                      {form.property.trim().length > 2 && (
                        <button 
                          onClick={() => setShowHotelMap(!showHotelMap)}
                          className="text-xs font-bold text-black flex items-center gap-1 hover:underline"
                        >
                          <MapPin className="w-3 h-3" />
                          {showHotelMap ? 'Hide Map' : 'View on Map'}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.property}
                        onFocus={() => setActiveSearchField('hotel')}
                        onChange={(e) => {
                          setForm({ ...form, property: e.target.value });
                          if (e.target.value.length < 3) setShowHotelMap(false);
                          setActiveSearchField('hotel');
                        }}
                        placeholder="e.g. Grand Hyatt Manila"
                        className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                      {activeSearchField === 'hotel' && (
                        <LocationSuggestions 
                          searchTerm={form.property} 
                          onSelect={(val) => {
                            setForm({ ...form, property: val });
                            setActiveSearchField(null);
                            setShowHotelMap(true);
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {showHotelMap && form.property.length > 3 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden bg-zinc-100 rounded-xl border border-border"
                    >
                      <iframe
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(form.property + ' hotels')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      ></iframe>
                      <div className="p-2 text-[10px] text-muted-foreground bg-white text-center italic">
                        Live Map Preview
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Destination</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.name}
                        onFocus={() => setActiveSearchField('dest')}
                        onChange={(e) => {
                          setForm({ ...form, name: e.target.value });
                          setActiveSearchField('dest');
                        }}
                        placeholder="e.g. Tokyo, Japan"
                        className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                      {activeSearchField === 'dest' && (
                        <LocationSuggestions 
                          searchTerm={form.name} 
                          onSelect={(val) => {
                            setForm({ ...form, name: val });
                            setActiveSearchField(null);
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {form.type === 'flight' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Flight Route</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={form.route}
                          onFocus={() => setActiveSearchField('route')}
                          onChange={(e) => {
                            setForm({ ...form, route: e.target.value });
                            setActiveSearchField('route');
                          }}
                          placeholder="e.g. MNL → NRT"
                          className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                        {activeSearchField === 'route' && (
                          <RouteSuggestions 
                            searchTerm={form.route} 
                            onSelect={(val) => {
                              setForm({ ...form, route: val });
                              setActiveSearchField(null);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {form.type === 'hotel' ? 'Check-in' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {form.type === 'hotel' ? 'Check-out' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              {/* Estimated Budget */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estimated Budget ({CURRENCY_SYMBOLS[useTravelStore.getState().settings.currency as keyof typeof CURRENCY_SYMBOLS] || '$'})
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>



              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Special Requests or Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any preferences, dietary needs, accessibility requirements, etc."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-black resize-none transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 p-6 border-t border-border bg-gray-50 rounded-b-xl">
              <Button onClick={handleSubmit} className="flex-1 bg-black hover:bg-gray-900 text-white py-3">
                <Send className="w-4 h-4 mr-2" />
                Submit Reservation Request
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ──── Mobile Sticky FAB ──── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 sm:hidden">
        <motion.button
          onClick={() => { setForm(emptyForm); setShowModal(true); }}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-gray-900 to-black text-white text-sm font-bold shadow-2xl shadow-black/40 border border-white/10 backdrop-blur-sm"
          style={{ fontFamily: 'Syne' }}
        >
          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          New Reservation
        </motion.button>
      </div>
    </div>
  );
}
