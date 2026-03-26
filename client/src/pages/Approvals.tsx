import { useState } from 'react';
import { useWayfarerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Check, X, MessageSquare, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function Approvals() {
  const { bookings, approveBooking, rejectBooking, approvalHistory } = useWayfarerStore();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const pendingBookings = bookings.filter((b) => b.status === 'in-review');

  const handleApprove = (bookingId: string) => {
    approveBooking(bookingId, comment);
    setSelectedBooking(null);
    setComment('');
    toast.success('Booking approved successfully');
  };

  const handleReject = (bookingId: string) => {
    if (!comment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectBooking(bookingId, comment);
    setSelectedBooking(null);
    setComment('');
    toast.success('Booking rejected');
  };

  const getBookingType = (type: string) => {
    switch (type) {
      case 'flight':
        return '✈️ Flight';
      case 'hotel':
        return '🏨 Hotel';
      case 'car':
        return '🚗 Car';
      default:
        return type;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-black text-white'
              : 'bg-card border border-border text-foreground hover:border-black'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending ({pendingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-black text-white'
              : 'bg-card border border-border text-foreground hover:border-black'
          }`}
        >
          <FileText className="w-4 h-4" />
          History ({approvalHistory.length})
        </button>
      </div>

      {/* Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings List */}
          <div className="lg:col-span-2 space-y-4">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking.id)}
                  className={`bg-card border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedBooking === booking.id
                      ? 'border-black shadow-lg'
                      : 'border-border hover:border-black/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                        {getBookingType(booking.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.name || booking.property}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-black">${booking.price}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Check-in</p>
                      <p className="text-foreground font-medium">
                        {new Date(booking.dates.start).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Check-out</p>
                      <p className="text-foreground font-medium">
                        {new Date(booking.dates.end).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {booking.route && (
                    <p className="text-sm text-muted-foreground">Route: {booking.route}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Syne' }}>
                  All Clear!
                </h3>
                <p className="text-muted-foreground">No pending approvals at this time.</p>
              </div>
            )}
          </div>

          {/* Approval Panel */}
          {selectedBooking && (
            <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-8">
              <h3 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: 'Syne' }}>
                Review Booking
              </h3>

              {/* Booking Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                {(() => {
                  const booking = bookings.find((b) => b.id === selectedBooking);
                  return booking ? (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Type</p>
                        <p className="text-sm text-foreground capitalize">{booking.type}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Amount</p>
                        <p className="text-lg font-bold text-black">${booking.price}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Duration</p>
                        <p className="text-sm text-foreground">
                          {Math.ceil(
                            (new Date(booking.dates.end).getTime() - new Date(booking.dates.start).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          days
                        </p>
                      </div>
                      {booking.notes && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Notes</p>
                          <p className="text-sm text-foreground">{booking.notes}</p>
                        </div>
                      )}
                    </>
                  ) : null;
                })()}
              </div>

              {/* Comment Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Add Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Approval notes (required for rejection)..."
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => handleApprove(selectedBooking)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(selectedBooking)}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => { setSelectedBooking(null); setComment(''); }}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {approvalHistory.length > 0 ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-card/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Booking</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">By</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {[...approvalHistory].reverse().map((record) => {
                    const booking = bookings.find((b) => b.id === record.bookingId);
                    return (
                      <tr key={record.id} className="border-b border-border hover:bg-card/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground">
                          {new Date(record.timestamp).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {booking ? (booking.name || booking.property) : `Booking #${record.bookingId}`}
                        </td>
                        <td className="px-6 py-4">
                          {record.action === 'approved' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{record.adminName}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {record.comment || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Syne' }}>
                No History Yet
              </h3>
              <p className="text-muted-foreground">Approval decisions will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
