import { useState } from 'react';
import { useTravelStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Check, X, MessageSquare, Clock, CheckCircle2, XCircle, FileText, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { BookingReceipt } from '@/components/BookingReceipt';
import { ApprovalTracker } from '@/components/ApprovalTracker';

export default function Approvals() {
  const { user, bookings, approveBooking, rejectBooking, approvalHistory } = useTravelStore();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const isAdmin = user?.role === 'admin';

  // Filter bookings based on role and status
  const pendingBookings = bookings.filter((b) => {
    const isPending = b.status === 'in-review';
    if (!isPending) return false;
    return isAdmin ? true : b.userId === user?.id;
  });

  const historyItems = approvalHistory.filter((item) => {
    if (isAdmin) return true;
    const booking = bookings.find(b => b.id === item.bookingId);
    return booking?.userId === user?.id;
  });

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
      case 'flight': return '✈️ Flight';
      case 'hotel': return '🏨 Hotel';
      case 'car': return '🚗 Car';
      default: return type;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Receipt Modal */}
      {viewingReceipt && (
        <BookingReceipt 
          bookingId={viewingReceipt} 
          onClose={() => setViewingReceipt(null)} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
            {isAdmin ? 'Approvals Management' : 'My Requests'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isAdmin 
              ? 'Review and manage booking requests from clients.' 
              : 'Track the status of your booking requests and view receipts.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-black text-white shadow-lg shadow-black/20'
              : 'bg-card border border-border text-foreground hover:border-black'
          }`}
        >
          <Clock className="w-4 h-4" />
          {isAdmin ? 'Pending Approvals' : 'Pending Requests'} ({pendingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-black text-white shadow-lg shadow-black/20'
              : 'bg-card border border-border text-foreground hover:border-black'
          }`}
        >
          <FileText className="w-4 h-4" />
          History ({historyItems.length})
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
                  className={`bg-card border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedBooking === booking.id
                      ? 'border-black shadow-xl scale-[1.01]'
                      : 'border-border hover:border-black/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-zinc-100 rounded text-zinc-600">
                          ID: {booking.id.slice(0, 8)}
                        </span>
                        {isAdmin && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded">
                            {booking.clientName}
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                        {getBookingType(booking.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.name || booking.property}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-black">${booking.price.toLocaleString()}</p>
                      {isAdmin ? (
                        <div className="flex flex-col gap-2 mt-2">
                           <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase h-8 px-4"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleApprove(booking.id);
                              }}
                           >
                              <Check className="w-3 h-3 mr-1" />
                              Approve
                           </Button>
                           <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-50 font-black text-[10px] uppercase h-8 px-4"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleReject(booking.id);
                              }}
                           >
                              <X className="w-3 h-3 mr-1" />
                              Reject
                           </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 mt-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-[10px] uppercase font-black bg-zinc-900 text-white hover:bg-black hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTrackingId(booking.id);
                            }}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Track Status
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-[10px] uppercase font-bold text-zinc-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingReceipt(booking.id);
                            }}
                          >
                            <Receipt className="w-3 h-3 mr-1" />
                            Quick Receipt
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Check-in</p>
                      <p className="text-foreground font-bold">
                        {new Date(booking.dates.start).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Check-out</p>
                      <p className="text-foreground font-bold">
                        {new Date(booking.dates.end).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {booking.route && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-zinc-50/50 p-2 rounded px-3 mb-4">
                      <span className="font-bold text-[10px] uppercase">Route:</span>
                      <span>{booking.route}</span>
                    </div>
                  )}

                  {/* Condensed Progress Line */}
                  <div className="pt-4 border-t border-zinc-100">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black uppercase text-zinc-400">Request Progress</span>
                        <span className="text-[9px] font-black uppercase text-black">{booking.status}</span>
                     </div>
                     <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                           className={`h-full transition-all duration-500 ${
                              booking.status === 'confirmed' ? 'bg-green-500' :
                              booking.status === 'cancelled' ? 'bg-red-500' : 'bg-black'
                           }`}
                           style={{ 
                              width: booking.status === 'in-review' ? '50%' : '100%' 
                           }}
                        />
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-2xl">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Syne' }}>
                  All Clear!
                </h3>
                <p className="text-muted-foreground">No pending {isAdmin ? 'approvals' : 'requests'} at this time.</p>
              </div>
            )}
          </div>

          {/* Action / Details Panel */}
          <div className="space-y-6">
            {selectedBooking ? (
              <div className="bg-card border-2 border-black rounded-2xl p-6 h-fit sticky top-8 shadow-2xl animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                    {isAdmin ? 'Review Booking' : 'Request Details'}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Tracker UI */}
                <div className="space-y-4 mb-6 pb-6 border-b border-border">
                  {(() => {
                    const booking = bookings.find((b) => b.id === selectedBooking);
                    return booking ? <ApprovalTracker booking={booking} /> : null;
                  })()}
                </div>

                {isAdmin ? (
                  <>
                    <div className="mb-6">
                      <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
                        <MessageSquare className="w-3 h-3 inline mr-2" />
                        Admin Feedback
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a reason for your choice..."
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={() => handleApprove(selectedBooking)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-bold"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve Booking
                      </Button>
                      <Button
                        onClick={() => handleReject(selectedBooking)}
                        variant="destructive"
                        className="w-full h-12 rounded-xl font-bold"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject Request
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground italic">
                      Your request is currently being reviewed by our administrators. You will be notified once a decision is made.
                    </p>
                    <Button 
                      className="w-full bg-black text-white rounded-xl h-12 font-bold"
                      onClick={() => setViewingReceipt(selectedBooking)}
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Generate Receipt
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:block bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center">
                <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm font-medium">Select a request to view full details and actions.</p>
              </div>
            )}

            {/* Aesthetic Stats Card */}
            <div className="bg-black text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">Queue Status</p>
                <p className="text-3xl font-black">{pendingBookings.length}</p>
                <p className="text-xs text-zinc-400 mt-2">Active requests needing attention.</p>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock className="w-20 h-20" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {historyItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...historyItems].reverse().map((record) => {
                const booking = bookings.find((b) => b.id === record.bookingId);
                if (!booking) return null;
                
                return (
                  <div key={record.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        record.action === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.action}
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded">
                          From: {booking.clientName || 'Client'}
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                        {booking.name || booking.property || `Booking #${record.bookingId.slice(0, 8)}`}
                      </h4>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">
                        {booking.type} • ${booking.price.toLocaleString()}
                      </p>
                    </div>

                    {record.comment && (
                      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 mb-4">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Administrator Comment</p>
                        <p className="text-xs text-zinc-600 italic">"{record.comment}"</p>
                      </div>
                    )}

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                             record.action === 'approved' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-red-600 text-white shadow-lg shadow-red-200'
                          }`}>
                            {record.action === 'approved' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-black uppercase">{record.action}</span>
                             <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">System Decision</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           {!isAdmin && (
                              <Button 
                                 size="sm" 
                                 variant="ghost" 
                                 className="h-8 px-3 text-zinc-900 font-black text-[10px] uppercase hover:bg-zinc-100 rounded-lg"
                                 onClick={() => setTrackingId(booking.id)}
                              >
                                 <Clock className="w-3 h-3 mr-1" />
                                 Track
                              </Button>
                           )}
                           <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-3 text-zinc-900 font-black text-[10px] uppercase hover:bg-zinc-100 rounded-lg group-hover:bg-zinc-100"
                              onClick={() => setViewingReceipt(booking.id)}
                           >
                              <Receipt className="w-3 h-3 mr-1" />
                              Receipt
                           </Button>
                        </div>
                      </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-2xl">
              <FileText className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'Syne' }}>
                No History Found
              </h3>
              <p className="text-muted-foreground">Decision history will appear here once bookings are processed.</p>
            </div>
          )}
        </div>
      )}
      {/* Tracking Modal */}
      {trackingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
           <div className="bg-white border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
                 <h2 className="text-xl font-bold text-zinc-900 uppercase" style={{ fontFamily: 'Syne' }}>Reservation Tracker</h2>
                 <Button variant="ghost" size="sm" onClick={() => setTrackingId(null)}>
                    <X className="w-5 h-5" />
                 </Button>
              </div>
              <div className="p-6">
                 {(() => {
                    const booking = bookings.find(b => b.id === trackingId);
                    return booking ? <ApprovalTracker booking={booking} /> : null;
                 })()}
              </div>
           </div>
        </div>
      )}

      {/* Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setViewingReceipt(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="p-4 sm:p-8">
              <BookingReceipt
                bookingId={viewingReceipt}
                onClose={() => setViewingReceipt(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

