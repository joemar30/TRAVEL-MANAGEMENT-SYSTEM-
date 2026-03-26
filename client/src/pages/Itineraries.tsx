import { useState } from 'react';
import { useWayfarerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Calendar, Plane, Hotel, Car, Trash2, Edit, X, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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

interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
}

const emptyForm: TripFormData = {
  destination: '',
  startDate: '',
  endDate: '',
};

export default function Itineraries() {
  const { trips, bookings, addTrip, updateTrip, deleteTrip } = useWayfarerStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TripFormData>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const sortedTrips = [...trips].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const getBookingsForTrip = (tripId: string) => {
    return bookings.filter((b) => b.tripId === tripId);
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'hotel': return <Hotel className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    setEditingId(tripId);
    setForm({
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error('Please fill in dates');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const nights = Math.ceil(
      (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (editingId) {
      updateTrip(editingId, {
        destination: form.destination.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        nights,
      });
      toast.success('Itinerary updated successfully');
    } else {
      addTrip({
        id: 'trip-' + Date.now(),
        destination: form.destination.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        nights,
        bookingIds: [],
        userId: 'user-demo-client',
      });
      toast.success('Itinerary created successfully');
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteTrip(id);
    setShowDeleteConfirm(null);
    toast.success('Itinerary deleted');
  };

  const generateRandomTrip = () => {
    const destinations = ['Tokyo, Japan', 'Paris, France', 'New York, USA', 'Singapore', 'Cape Town, SA', 'London, UK', 'Sydney, Australia', 'Dubai, UAE'];
    const dest = destinations[Math.floor(Math.random() * destinations.length)];
    
    // Create random dates in the future
    const start = new Date();
    start.setDate(start.getDate() + Math.random() * 30 + 5);
    const end = new Date(start);
    end.setDate(end.getDate() + Math.random() * 7 + 3);

    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    addTrip({
      id: 'trip-' + Date.now(),
      destination: dest,
      startDate,
      endDate,
      nights,
      bookingIds: [],
      userId: 'user-demo-client',
    });
    toast.success(`Generated a random trip to ${dest}!`);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Total itineraries: {trips.length}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateRandomTrip} variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50">
            <Sparkles className="w-4 h-4 mr-2" />
            Randomize
          </Button>
          <Button onClick={openAddModal} className="bg-black hover:bg-gray-900 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Itinerary
          </Button>
        </div>
      </div>

      {/* Itineraries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedTrips.map((trip) => {
          const tripBookings = getBookingsForTrip(trip.id);
          const startDate = new Date(trip.startDate);
          const endDate = new Date(trip.endDate);
          const totalCost = tripBookings.reduce((sum, b) => sum + b.price, 0);

          return (
            <div key={trip.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all">
              {/* Trip Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                    {trip.destination}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {trip.nights} nights • {tripBookings.length} bookings
                    {totalCost > 0 && ` • ${CURRENCY_SYMBOLS[useWayfarerStore.getState().settings.currency as keyof typeof CURRENCY_SYMBOLS] || '$'}${totalCost.toLocaleString()}`}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg px-3 py-2 min-w-fit">
                  <p className="text-xs text-muted-foreground font-medium">
                    {startDate.toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-xl font-bold text-black">{startDate.getDate()}</p>
                </div>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Calendar className="w-4 h-4" />
                <span>
                  {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                  {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Bookings */}
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Bookings</p>
                {tripBookings.length > 0 ? (
                  tripBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="w-8 h-8 bg-black/5 rounded flex items-center justify-center text-black">
                        {getBookingIcon(booking.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {booking.name || booking.property}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {CURRENCY_SYMBOLS[useWayfarerStore.getState().settings.currency as keyof typeof CURRENCY_SYMBOLS] || '$'}
                          {booking.price}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        booking.status === 'in-review' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>{booking.status}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No bookings added</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openEditModal(trip.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {showDeleteConfirm === trip.id ? (
                  <div className="flex gap-1">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(trip.id)}>
                      Confirm
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(trip.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {trips.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No itineraries yet. Create one to get started!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                {editingId ? 'Edit Itinerary' : 'New Itinerary'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Destination</label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  placeholder="e.g. Tokyo, Japan"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button onClick={handleSubmit} className="flex-1 bg-black hover:bg-gray-900 text-white">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => { setShowModal(false); setEditingId(null); }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
