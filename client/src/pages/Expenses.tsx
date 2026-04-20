import { useState, useMemo } from 'react';
import { useTravelStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Printer,
  Filter,
  Plane,
  Hotel,
  Car,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  BarChart3,
  Search,
  Receipt,
} from 'lucide-react';
import { BookingReceipt } from '@/components/BookingReceipt';

const CURRENCY_SYMBOLS: Record<string, string> = {
  PHP: '₱',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  KRW: '₩',
  SGD: 'S$',
  BTC: '₿',
};

export default function Expenses() {
  const { bookings, trips, settings } = useTravelStore();
  const sym = CURRENCY_SYMBOLS[settings.currency] || '$';

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTrip, setFilterTrip] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // ── Derived metrics ──────────────────────────────────────────
  const confirmedBookings = useMemo(
    () => bookings.filter((b) => b.status === 'confirmed'),
    [bookings]
  );
// ... existing useMemos remain similar, but let's update the filter with search ...
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filterStatus !== 'all' && b.status !== filterStatus) return false;
      if (filterTrip !== 'all' && b.tripId !== filterTrip) return false;
      if (filterType !== 'all' && b.type !== filterType) return false;
      if (searchTerm && !b.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) && !b.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [bookings, filterStatus, filterTrip, filterType, searchTerm]);

  const totalProfit = useMemo(
    () => confirmedBookings.reduce((sum, b) => sum + b.price, 0),
    [confirmedBookings]
  );

  const pendingRevenue = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'in-review' || b.status === 'pending')
        .reduce((sum, b) => sum + b.price, 0),
    [bookings]
  );

  const totalBookings = bookings.length;
  const confirmedCount = confirmedBookings.length;

  const getTripName = (tripId?: string) => {
    if (!tripId) return '—';
    return trips.find((t) => t.id === tripId)?.destination || 'Unknown Trip';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'hotel': return <Hotel className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
      case 'in-review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
            In Review
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
            Cancelled
          </span>
        );
      default: return null;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-10 space-y-8 bg-zinc-50/50 min-h-screen">
      {viewingReceipt && (
        <BookingReceipt 
          bookingId={viewingReceipt} 
          onClose={() => setViewingReceipt(null)} 
        />
      )}

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase" style={{ fontFamily: 'Syne' }}>
            Financial Oversight
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Projected and actual revenue summary from client activity.
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
             <input 
               type="text"
               placeholder="Search records..."
               className="pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none w-64 shadow-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
          <Button
            onClick={handlePrint}
            className="gap-2 bg-zinc-900 text-white hover:bg-black rounded-xl h-11 px-6 shadow-lg shadow-black/10 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Profit */}
        <div className="bg-black text-white rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Total Earnings</p>
            <p className="text-3xl font-black tracking-tighter">
              {sym}{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <div className="h-1 w-12 bg-white/20 rounded-full" />
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">From {confirmedCount} Bookings</p>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 -rotate-12 transition-transform group-hover:rotate-0 duration-500" />
        </div>

        {/* Pending Revenue */}
        <div className="bg-white border-2 border-zinc-100 rounded-3xl p-8 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Awaiting Review</p>
          <p className="text-3xl font-black text-zinc-900 tracking-tighter">
            {sym}{pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2 mt-4 text-[10px] text-amber-600 font-black uppercase">
             <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
             Potential Revenue
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white border-2 border-zinc-100 rounded-3xl p-8 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Volume</p>
          <p className="text-3xl font-black text-zinc-900 tracking-tighter">{totalBookings}</p>
          <p className="text-[10px] text-zinc-400 font-bold uppercase mt-4 tracking-wider">Total Reservations</p>
        </div>

        {/* Avg Per Booking */}
        <div className="bg-white border-2 border-zinc-100 rounded-3xl p-8 shadow-sm">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Avg Transaction</p>
          <p className="text-3xl font-black text-zinc-900 tracking-tighter">
            {sym}{confirmedCount > 0 ? (totalProfit / confirmedCount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
          </p>
          <p className="text-[10px] text-zinc-400 font-bold uppercase mt-4 tracking-wider">Per confirmation</p>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 print:hidden">
        <div className="flex items-center gap-3 bg-white border border-zinc-200 px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="bg-zinc-100 p-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-xs font-bold text-zinc-700 focus:outline-none cursor-pointer pr-2 uppercase pb-0.5"
          >
            <option value="all">Status: All</option>
            <option value="confirmed">confirmed</option>
            <option value="in-review">in review</option>
            <option value="pending">pending</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-3 bg-white border border-zinc-200 px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="bg-zinc-100 p-1.5 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent text-xs font-bold text-zinc-700 focus:outline-none cursor-pointer pr-2 uppercase pb-0.5"
          >
            <option value="all">Type: All</option>
            <option value="flight">Flights</option>
            <option value="hotel">Hotels</option>
            <option value="car">Car Service</option>
          </select>
        </div>

        {trips.length > 0 && (
          <div className="flex items-center gap-3 bg-white border border-zinc-200 px-4 py-2.5 rounded-2xl shadow-sm">
            <div className="bg-zinc-100 p-1.5 rounded-lg">
              <BarChart3 className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <select
              value={filterTrip}
              onChange={(e) => setFilterTrip(e.target.value)}
              className="bg-transparent text-xs font-bold text-zinc-700 focus:outline-none cursor-pointer pr-2 uppercase pb-0.5 max-w-[150px] truncate"
            >
              <option value="all">Trip: All</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>{trip.destination}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Bookings Table ────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-4">
             <div className="w-2 h-8 bg-black rounded-full" />
             <h3 className="font-black text-xl text-zinc-900 tracking-tighter" style={{ fontFamily: 'Syne' }}>
               Revenue Ledger
             </h3>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-sm">
                {filteredBookings.length} Records found
             </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/80">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] w-20">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Requester</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Reservation</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Travel window</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-zinc-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform group-hover:scale-110">
                        {getTypeIcon(booking.type)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-zinc-900">{booking.clientName || '—'}</p>
                      <p className="text-[10px] text-zinc-400 font-bold">{booking.clientEmail}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-zinc-900">{booking.name || booking.property || '—'}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{getTripName(booking.tripId)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="space-y-0.5">
                            <p className="text-xs font-black text-zinc-900">
                               {new Date(booking.dates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <div className="h-px w-full bg-zinc-200" />
                            <p className="text-xs font-black text-zinc-900">
                               {new Date(booking.dates.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">{getStatusBadge(booking.status)}</td>
                    <td className="px-8 py-6 text-right">
                      <p className={`text-base font-black tracking-tighter ${booking.status === 'confirmed' ? 'text-green-600' : booking.status === 'cancelled' ? 'text-red-400' : 'text-zinc-900'}`}>
                        {sym}{booking.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center print:hidden">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-8 w-8 p-0 rounded-full hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
                         onClick={() => setViewingReceipt(booking.id)}
                       >
                         <Receipt className="w-4 h-4" />
                       </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <TrendingUp className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
                    <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No matching ledger entries</p>
                  </td>
                </tr>
              )}
            </tbody>
            {filteredBookings.length > 0 && (
              <tfoot>
                <tr className="bg-zinc-50/50">
                  <td colSpan={6} className="px-8 py-8 text-right">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Aggregated Confirmation Total</p>
                       <p className="text-4xl font-black text-zinc-900 tracking-tighter">
                         {sym}{filteredBookings
                           .filter(b => filterStatus !== 'all' ? true : b.status === 'confirmed')
                           .reduce((sum, b) => sum + b.price, 0)
                           .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </p>
                    </div>
                  </td>
                  <td className="print:hidden"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Print Styles (injected inline) ────────────────────── */}
      <style>{`
        @media print {
          body { background: white !important; }
          .p-6, .p-10 { padding: 20px !important; }
          .shadow-2xl, .shadow-lg, .shadow-sm { box-shadow: none !important; border: 1px solid #eee !important; }
          .rounded-[2.5rem], .rounded-3xl { border-radius: 12px !important; }
          .print\\:hidden, .no-print, button { display: none !important; }
          select, input { display: none !important; }
          .grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 10px !important; }
          .bg-emerald-500, .bg-black { background: #000 !important; color: white !important; -webkit-print-color-adjust: exact; }
          .text-emerald-500, .text-green-600 { color: #059669 !important; }
          .bg-zinc-50\\/50 { background: #fafafa !important; }
        }
      `}</style>
    </div>
  );
}

