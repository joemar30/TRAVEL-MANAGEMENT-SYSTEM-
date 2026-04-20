import { useState } from 'react';
import { useTravelStore, BookingStatus, BookingType } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Plane,
  Hotel,
  Car,
  MapPin,
  Trash2,
  Edit,
  Plus,
  X,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface BookingFormData {
  type: BookingType;
  name: string;
  route: string;
  property: string;
  startDate: string;
  endDate: string;
  price: string;
  status: BookingStatus;
  notes: string;
  tripId: string;
}

const emptyForm: BookingFormData = {
  type: 'flight',
  name: '',
  route: '',
  property: '',
  startDate: '',
  endDate: '',
  price: '',
  status: 'pending',
  notes: '',
  tripId: '',
};

export default function Bookings() {
  const { bookings, trips, addBooking, updateBooking, deleteBooking } = useTravelStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BookingFormData>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-5 h-5" />;
      case 'hotel':
        return <Hotel className="w-5 h-5" />;
      case 'car':
        return <Car className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
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

  const filteredBookings = bookings.filter((booking) => {
    if (filterType !== 'all' && booking.type !== filterType) return false;
    if (filterStatus !== 'all' && booking.status !== filterStatus) return false;
    return true;
  });

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateBooking(bookingId, { status: newStatus });
    toast.success(`Status updated to ${newStatus}`);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    setEditingId(bookingId);
    setForm({
      type: booking.type,
      name: booking.name || '',
      route: booking.route || '',
      property: booking.property || '',
      startDate: booking.dates.start,
      endDate: booking.dates.end,
      price: booking.price.toString(),
      status: booking.status,
      notes: booking.notes || '',
      tripId: booking.tripId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.startDate || !form.endDate) {
      toast.error('Please fill in dates');
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      toast.error('Please enter a valid price');
      return;
    }
    if (form.type === 'hotel' && !form.property.trim()) {
      toast.error('Please enter a property name');
      return;
    }
    if (form.type !== 'hotel' && !form.name.trim()) {
      toast.error('Please enter a booking name');
      return;
    }

    const bookingData = {
      type: form.type,
      name: form.type !== 'hotel' ? form.name.trim() : undefined,
      route: form.type === 'flight' ? form.route.trim() : undefined,
      property: form.type === 'hotel' ? form.property.trim() : undefined,
      dates: { start: form.startDate, end: form.endDate },
      price: Number(form.price),
      status: form.status,
      notes: form.notes.trim() || undefined,
      tripId: form.tripId || undefined,
    };

    if (editingId) {
      updateBooking(editingId, bookingData);
      toast.success('Booking updated successfully');
    } else {
      addBooking({
        ...bookingData,
        id: 'booking-' + Date.now(),
        userId: 'user-demo-client',
      });
      toast.success('Booking created successfully');
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteBooking(id);
    setShowDeleteConfirm(null);
    toast.success('Booking deleted');
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Total bookings: {filteredBookings.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground font-medium py-2">Type:</span>
          {['all', 'flight', 'hotel', 'car'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-black text-white'
                  : 'bg-card border border-border text-foreground hover:border-black'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground font-medium py-2">Status:</span>
          {['all', 'confirmed', 'pending', 'in-review', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-black text-white'
                  : 'bg-card border border-border text-foreground hover:border-black'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Dates</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
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
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">${booking.price}</td>
                  <td className="px-6 py-4">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(booking.status)}`}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="in-review">In Review</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(booking.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {showDeleteConfirm === booking.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="px-2 py-1 bg-destructive text-white text-xs rounded font-medium"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-2 py-1 bg-gray-200 text-foreground text-xs rounded font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(booking.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                {editingId ? 'Edit Booking' : 'New Booking'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['flight', 'hotel', 'car'] as BookingType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, type })}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium capitalize flex items-center justify-center gap-2 ${
                        form.type === type
                          ? 'border-black bg-black/5'
                          : 'border-border hover:border-black/30'
                      }`}
                    >
                      {type === 'flight' && <Plane className="w-4 h-4" />}
                      {type === 'hotel' && <Hotel className="w-4 h-4" />}
                      {type === 'car' && <Car className="w-4 h-4" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name / Property */}
              {form.type === 'hotel' ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Property Name</label>
                  <input
                    type="text"
                    value={form.property}
                    onChange={(e) => setForm({ ...form, property: e.target.value })}
                    placeholder="e.g. Grand Hyatt Tokyo"
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Destination / Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Tokyo, Japan"
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                  {form.type === 'flight' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Route</label>
                      <input
                        type="text"
                        value={form.route}
                        onChange={(e) => setForm({ ...form, route: e.target.value })}
                        placeholder="e.g. MNL → NRT"
                        className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Dates */}
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

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price ($)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              {/* Trip */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Associated Trip (optional)</label>
                <select
                  value={form.tripId}
                  onChange={(e) => setForm({ ...form, tripId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                >
                  <option value="">No trip</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>{trip.destination}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button onClick={handleSubmit} className="flex-1 bg-black hover:bg-gray-900 text-white">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update Booking' : 'Create Booking'}
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
