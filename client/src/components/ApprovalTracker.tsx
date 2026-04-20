import React from 'react';
import { FileText, Clock, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { Booking } from '../lib/store';

interface ApprovalTrackerProps {
  booking: Booking;
}

export const ApprovalTracker: React.FC<ApprovalTrackerProps> = ({ booking }) => {
  const steps = [
    { id: 'submitted', label: 'Submitted', status: 'completed', icon: <FileText className="w-4 h-4" /> },
    { id: 'review', label: 'In Review', status: booking.status === 'in-review' ? 'active' : 'completed', icon: <Clock className="w-4 h-4" /> },
    { id: 'decision', label: 'Decision', status: booking.status === 'in-review' ? 'pending' : 'completed', icon: booking.status === 'confirmed' ? <CheckCircle2 className="w-4 h-4" /> : booking.status === 'cancelled' ? <XCircle className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" /> },
    { id: 'done', label: 'Done', status: ['confirmed', 'cancelled'].includes(booking.status) ? 'active' : 'pending', icon: <CheckCircle2 className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-8">
      {/* Tracker Stepper */}
      <div className="mb-8 pt-4">
        <div className="relative flex justify-between">
          {/* Lines */}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-zinc-100 -z-10" />
          <div 
            className="absolute top-5 left-0 h-[2px] bg-black transition-all duration-500 -z-10" 
            style={{ width: `${(steps.filter(s => s.status === 'completed').length / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                step.status === 'completed' ? 'bg-black border-black text-white' :
                step.status === 'active' ? 'bg-white border-black text-black shadow-lg shadow-black/10' :
                'bg-white border-zinc-200 text-zinc-300'
              }`}>
                {step.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${
                step.status === 'pending' ? 'text-zinc-300' : 'text-black'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Package Information Style */}
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 mb-6">
         <div className="flex justify-between items-start mb-4">
            <div>
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tracking Number</p>
               <p className="text-xs font-black font-mono text-zinc-900 uppercase">WAY-{booking.id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Current Gate</p>
               <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  booking.status === 'in-review' ? 'bg-amber-100 text-amber-700' :
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
               }`}>
                  {booking.status}
               </span>
            </div>
         </div>

         <div className="space-y-3">
            <div className="flex justify-between text-[11px]">
               <span className="text-zinc-500 font-bold">Booking Requester</span>
               <span className="text-zinc-900 font-black">{booking.clientName || 'Client'}</span>
            </div>
            <div className="flex justify-between text-[11px]">
               <span className="text-zinc-500 font-bold">Contact Email</span>
               <span className="text-zinc-900 font-black truncate max-w-[150px]">{booking.clientEmail}</span>
            </div>
            <div className="flex justify-between text-[11px]">
               <span className="text-zinc-500 font-bold">Submission Time</span>
               <span className="text-zinc-900 font-black">{new Date(booking.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
         </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="space-y-4">
         <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Activity Timeline</p>
         
         <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100">
            {/* Final State */}
            {['confirmed', 'cancelled'].includes(booking.status) && (
               <div className="relative group">
                  <div className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-4 transition-all ${
                     booking.status === 'confirmed' ? 'bg-green-500 ring-green-100' : 'bg-red-500 ring-red-100'
                  }`} />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-black">{booking.status === 'confirmed' ? 'APPROVED' : 'REJECTED'}</span>
                     <span className="text-xs text-zinc-500 font-medium">{booking.adminComment || 'Administrative review completed.'}</span>
                     <span className="text-[9px] text-zinc-300 font-bold mt-1 uppercase">
                        {booking.statusUpdatedAt ? new Date(booking.statusUpdatedAt).toLocaleString() : 'Just now'}
                     </span>
                  </div>
               </div>
            )}

            {/* In Review State */}
            <div className="relative group">
               <div className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-4 transition-all ${
                  booking.status === 'in-review' ? 'bg-amber-500 ring-amber-100 animate-pulse' : 'bg-zinc-300 ring-zinc-50'
               }`} />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-black">ADMINISTRATIVE REVIEW</span>
                  <span className="text-xs text-zinc-500 font-medium">Your request is currently being verified for travel policy compliance.</span>
                  {booking.status === 'in-review' && (
                     <span className="text-[9px] text-zinc-300 font-bold mt-1 uppercase">In Progress</span>
                  )}
               </div>
            </div>

            {/* Submission State */}
            <div className="relative group">
               <div className="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-zinc-300 border-2 border-white ring-4 ring-zinc-50" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-black">REQUEST SUBMITTED</span>
                  <span className="text-xs text-zinc-500 font-medium">System successfully logged your travel reservation request.</span>
                  <span className="text-[9px] text-zinc-300 font-bold mt-1 uppercase">
                     {new Date(booking.created_at || Date.now()).toLocaleString()}
                  </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
