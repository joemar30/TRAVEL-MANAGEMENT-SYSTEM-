import { useTravelStore } from "@/lib/store";
import { Printer, X, Download } from "lucide-react";
import { Button } from "./ui/button";

interface BookingReceiptProps {
  bookingId: string;
  onClose: () => void;
}

export function BookingReceipt({ bookingId, onClose }: BookingReceiptProps) {
  const { bookings, settings } = useTravelStore();
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) return null;

  const currencySymbol = settings.currency.split(' ')[1] || '$';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative group max-w-sm w-full">
        {/* Receipt Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden; }
            .pro-receipt-container, .pro-receipt-container * { visibility: visible; }
            .pro-receipt-container { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
            }
            .no-print { display: none !important; }
          }
          
          .thermal-edges {
            filter: drop-shadow(0 0 10px rgba(0,0,0,0.1));
            background: #fff;
            position: relative;
          }
          
          .thermal-edges::before,
          .thermal-edges::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            height: 10px;
            z-index: 10;
            background-repeat: repeat-x;
            background-size: 20px 10px;
          }
          
          .thermal-edges::before {
            top: -10px;
            background-image: radial-gradient(circle at 10px -5px, transparent 12px, #fff 13px);
          }
          
          .thermal-edges::after {
            bottom: -10px;
            background-image: radial-gradient(circle at 10px 15px, transparent 12px, #fff 13px);
          }
        `}} />

        {/* Action Buttons (Floating) */}
        <div className="absolute -right-16 top-0 flex flex-col gap-3 no-print hidden lg:flex">
          <Button onClick={handlePrint} size="icon" className="bg-white text-black hover:bg-zinc-200 rounded-full w-12 h-12 shadow-xl">
            <Printer className="w-5 h-5" />
          </Button>
          <Button onClick={onClose} size="icon" variant="destructive" className="rounded-full w-12 h-12 shadow-xl">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* The Receipt Structure */}
        <div className="pro-receipt-container thermal-edges p-8 font-mono text-zinc-800 shadow-2xl scale-in-center animate-in zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="text-center space-y-1 mb-6">
            <h1 className="text-xl font-black tracking-tighter uppercase mb-2" style={{ fontFamily: 'monospace' }}>
              TRAVEL
            </h1>
            <p className="text-[10px]">ADDRESS: 1234 TRAVEL BLVD, MANILA</p>
            <p className="text-[10px]">TEL: +63 912-345-6789</p>
          </div>

          <div className="border-t border-dashed border-zinc-400 my-4" />

          {/* Date & Time */}
          <div className="flex justify-between text-xs mb-4">
            <span className="font-bold">DATE: {new Date(booking.created_at || Date.now()).toLocaleDateString()}</span>
            <span className="font-bold">TIME: {new Date(booking.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="border-t border-dashed border-zinc-400 my-4" />

          {/* Client Info */}
          <div className="text-xs mb-6 space-y-1 text-center">
            <p className="font-bold uppercase tracking-widest text-[10px] text-zinc-400">Booking Requester</p>
            <p className="text-lg font-black">{booking.clientName?.toUpperCase() || 'VALUED CLIENT'}</p>
            <p className="text-[9px] opacity-60 tracking-widest">ID: {booking.id.toUpperCase().slice(0, 8)}</p>
          </div>

          <div className="border-t border-dashed border-zinc-400 my-4" />

          {/* Items */}
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-xs items-baseline">
              <span className="max-w-[70%]">{booking.type.toUpperCase()} • {booking.name || booking.property}</span>
              <span className="font-bold">{currencySymbol}{booking.price.toLocaleString()}</span>
            </div>
            {booking.route && (
              <p className="text-[9px] italic opacity-70">ROUTE: {booking.route}</p>
            )}
            <div className="flex justify-between text-xs opacity-60">
              <span className="text-[9px]">PERIOD</span>
              <span className="text-[9px]">{new Date(booking.dates.start).toLocaleDateString()} - {new Date(booking.dates.end).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Total Section */}
          <div className="border-t-2 border-zinc-800 pt-4 mb-8">
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-black uppercase">TOTAL</span>
              <span className="text-2xl font-black">{currencySymbol}{booking.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] mt-2 font-bold">
              <span>SUB-TOTAL</span>
              <span>{currencySymbol}{booking.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] opacity-60">
              <span>SALES TAX (0%)</span>
              <span>{currencySymbol}0.00</span>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center space-y-4 pt-4 border-t border-dashed border-zinc-400">
             <div className={`inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] ${
                booking.status === 'confirmed' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-600'
             }`}>
                {booking.status === 'in-review' ? 'PENDING APPROVAL' : booking.status.toUpperCase()}
             </div>

             {booking.adminComment && (
                <div className="text-[9px] italic border border-zinc-200 p-2 rounded">
                   "{booking.adminComment}"
                </div>
             )}

             <h2 className="text-sm font-black tracking-[0.2em] pt-4">THANK YOU</h2>
             
             {/* Barcode */}
             <div className="flex flex-col items-center gap-1 opacity-80 py-4">
                <div className="flex gap-px h-10 w-48">
                   {[...Array(64)].map((_, i) => (
                      <div key={i} className={`bg-black flex-1 ${Math.random() > 0.4 ? 'w-px' : 'w-0'}`} />
                   ))}
                </div>
                <span className="text-[8px] font-bold tracking-[1em]">{booking.id.slice(0, 12).toUpperCase()}</span>
             </div>
          </div>
        </div>

        {/* Footer Actions (Mobile Only) */}
        <div className="mt-8 flex gap-2 no-print lg:hidden pb-10">
          <Button onClick={handlePrint} className="flex-1 bg-white text-black hover:bg-zinc-100 rounded-xl h-12 shadow-xl font-bold">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={onClose} variant="destructive" className="flex-1 rounded-xl h-12 shadow-xl font-bold">
             Close
          </Button>
        </div>
      </div>
    </div>
  );
}

