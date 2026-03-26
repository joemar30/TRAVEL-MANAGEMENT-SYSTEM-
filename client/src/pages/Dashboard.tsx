import { useWayfarerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Plus,
  Calendar,
  RotateCcw,
  FileText,
  Plane,
  Hotel,
  Car,
  MapPin,
  DollarSign,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'wouter';

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

export default function Dashboard() {
  const { bookings, trips, expenses, user } = useWayfarerStore();
  const isAdmin = user?.role === 'admin';

  // Calculate metrics
  const activeBookings = bookings.filter((b) => b.status !== 'cancelled').length;
  const totalSpend = bookings.reduce((sum, b) => sum + b.price, 0) + expenses.reduce((sum, e) => sum + e.amount, 0);
  const upcomingTrips = trips.filter((t) => new Date(t.startDate) > new Date()).length;
  const pendingApprovals = bookings.filter((b) => b.status === 'in-review').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;

  // Get recent bookings
  const recentBookings = bookings.slice(-5).reverse() as typeof bookings;

  // Get upcoming trips sorted by date
  const upcomingTripsSorted = trips
    .filter((t: typeof trips[0]) => new Date(t.startDate) > new Date())
    .sort((a: typeof trips[0], b: typeof trips[0]) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-6 h-6" />;
      case 'hotel':
        return <Hotel className="w-6 h-6" />;
      case 'car':
        return <Car className="w-6 h-6" />;
      default:
        return <MapPin className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'in-review':
        return 'status-in-review';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  // ──── CLIENT VIEW (Overview only) ────
  if (!isAdmin) {
    return (
      <div className="p-8 space-y-8">
        {/* Welcome + Quick Action */}
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Syne' }}>
                Welcome back, {user?.full_name}!
              </h2>
              <p className="text-muted-foreground">
                Here's an overview of your travel activity.
              </p>
            </div>
            <Link href="/my-bookings">
              <Button className="bg-black hover:bg-gray-900 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Reservation
              </Button>
            </Link>
          </div>
        </div>

        {/* Client Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">My Bookings</p>
                <p className="text-3xl font-bold text-foreground mt-2">{activeBookings}</p>
                <p className="text-gray-600 text-xs font-medium mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {confirmedBookings} confirmed
                </p>
              </div>
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {CURRENCY_SYMBOLS[useWayfarerStore.getState().settings.currency as keyof typeof CURRENCY_SYMBOLS] || '$'}
                  {totalSpend.toLocaleString()}
                </p>
                <p className="text-gray-600 text-xs font-medium mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Across all trips
                </p>
              </div>
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Upcoming Trips</p>
                <p className="text-3xl font-bold text-foreground mt-2">{upcomingTrips}</p>
                <p className="text-gray-600 text-xs font-medium mt-2">
                  Next: {upcomingTripsSorted[0]?.startDate ? new Date(upcomingTripsSorted[0].startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* My Recent Bookings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
              My Recent Bookings
            </h2>
            <Link href="/my-bookings">
              <a className="text-black text-sm font-medium hover:underline">View all →</a>
            </Link>
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Dates</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-black">
                        {getBookingIcon(booking.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{booking.name || booking.property}</p>
                      {booking.route && <p className="text-xs text-muted-foreground">{booking.route}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(booking.dates.start).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {CURRENCY_SYMBOLS[useWayfarerStore.getState().settings.currency as keyof typeof CURRENCY_SYMBOLS] || '$'}
                      {booking.price}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Trip Locations Map Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
              Travel Map Overview
            </h2>
            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Live View</span>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm h-[300px] relative group">
             {/* If MapView is ready, we use it. For now, we'll use our reliable iframe for the next destination */}
             <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent((upcomingTripsSorted[0]?.destination || 'Manila, Philippines') + ' hotels')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
              
              {/* Overlay for polish */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Next Destination</p>
                    <p className="text-sm font-bold">{upcomingTripsSorted[0]?.destination || 'No upcoming trips'}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    Open in Maps
                  </Button>
                </div>
              </div>
          </div>
        </div>

        {/* Upcoming Trips List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
            Upcoming Trips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTripsSorted.length > 0 ? upcomingTripsSorted.map((trip: typeof trips[0]) => {
              const startDate = new Date(trip.startDate);
              return (
                <div key={trip.id} className="booking-card">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg px-4 py-3 min-w-fit">
                      <p className="text-xs text-muted-foreground font-medium">
                        {startDate.toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-2xl font-bold text-black">
                        {startDate.getDate()}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{trip.destination}</p>
                      <p className="text-xs text-muted-foreground">
                        {trip.nights} nights • {trip.bookingIds.length} bookings
                      </p>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-muted-foreground text-sm col-span-3">No upcoming trips</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──── ADMIN VIEW (Full Dashboard) ────
  return (
    <div className="p-8 space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Bookings */}
        <Link href="/bookings">
          <div className="stat-card cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active bookings</p>
                <p className="text-3xl font-bold text-foreground mt-2">{activeBookings}</p>
                <p className="text-gray-600 text-xs font-medium mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {confirmedBookings} confirmed
                </p>
              </div>
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </Link>

        {/* Total Spend */}
        <Link href="/expenses">
          <div className="stat-card cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total spend</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {CURRENCY_SYMBOLS[useWayfarerStore.getState().settings.currency as keyof typeof CURRENCY_SYMBOLS] || '$'}
                  {totalSpend.toLocaleString()}
                </p>
                <p className="text-gray-600 text-xs font-medium mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  12% vs last month
                </p>
              </div>
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </Link>

        {/* Upcoming Trips */}
        <Link href="/itineraries">
          <div className="stat-card cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Upcoming trips</p>
                <p className="text-3xl font-bold text-foreground mt-2">{upcomingTrips}</p>
                <p className="text-gray-600 text-xs font-medium mt-2">
                  Next: {upcomingTripsSorted[0]?.startDate ? new Date(upcomingTripsSorted[0].startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </Link>

        {/* Pending Approvals */}
        <Link href="/approvals">
          <div className="stat-card cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Pending approvals</p>
                <p className="text-3xl font-bold text-foreground mt-2">{pendingApprovals}</p>
                <p className={`text-xs font-medium mt-2 ${pendingApprovals > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {pendingApprovals > 0 ? 'Requires action' : 'All approved'}
                </p>
              </div>
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
              Recent Bookings
            </h2>
            <Link href="/bookings">
              <a className="text-black text-sm font-medium hover:underline">View all</a>
            </Link>
          </div>

          <div className="space-y-3">
            {recentBookings.map((booking: typeof bookings[0]) => (
              <div key={booking.id} className="booking-card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-black flex-shrink-0">
                    {getBookingIcon(booking.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {booking.name || booking.property}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.dates.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">
                      {CURRENCY_SYMBOLS[useWayfarerStore.getState().settings.currency as keyof typeof CURRENCY_SYMBOLS] || '$'}
                      {booking.price}
                    </p>
                    <span className={`status-badge ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Trips & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Trips */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                Upcoming Trips
              </h2>
            <Link href="/itineraries">
              <a className="text-black text-sm font-medium hover:underline">Calendar</a>
            </Link>
            </div>

            <div className="space-y-3">
              {upcomingTripsSorted.map((trip: typeof trips[0]) => {
                const startDate = new Date(trip.startDate);
                return (
                  <div key={trip.id} className="booking-card">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg px-4 py-3 min-w-fit">
                        <p className="text-xs text-muted-foreground font-medium">
                          {startDate.toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-2xl font-bold text-black">
                          {startDate.getDate()}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{trip.destination}</p>
                        <p className="text-xs text-muted-foreground">
                          {trip.nights} nights • {trip.bookingIds.length} bookings
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
              Quick Actions
            </h2>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-black text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  Route map: MNL → NRT → DXB
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/bookings?action=new">
                  <Button className="w-full bg-black hover:bg-gray-900 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New booking
                  </Button>
                </Link>
                <Link href="/itineraries">
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    View calendar
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View reports
                  </Button>
                </Link>
                <Link href="/expenses">
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Manage expenses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
