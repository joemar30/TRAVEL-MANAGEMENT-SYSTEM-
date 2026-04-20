import { useState, useMemo } from 'react';
import { useTravelStore } from '@/lib/store';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  PieChart as PieIcon, 
  DollarSign, 
  Users, 
  ArrowUpRight,
  ChevronRight,
  Filter,
  X,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Button } from '@/components/ui/button';

export default function Reports() {
  const { bookings, expenses, trips, settings } = useTravelStore();
  const [timeframe, setTimeframe] = useState<'all' | '30d'>('all');
  const [detailModal, setDetailModal] = useState<{ title: string; type: 'bookings' | 'expenses' | 'trips'; items: any[] } | null>(null);

  const currencySymbol = settings?.currency?.split(' ')[1] || '$';

  // Memoized Filtered Data
  const filteredBookings = useMemo(() => {
    if (timeframe === 'all') return bookings;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return bookings.filter(b => new Date(b.created_at || Date.now()) >= thirtyDaysAgo);
  }, [bookings, timeframe]);

  const filteredExpenses = useMemo(() => {
    if (timeframe === 'all') return expenses;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
  }, [expenses, timeframe]);

  const filteredTrips = useMemo(() => {
    if (timeframe === 'all') return trips;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return trips.filter(t => new Date((t as any).created_at || t.startDate || Date.now()) >= thirtyDaysAgo);
  }, [trips, timeframe]);

  // Calculate statistics based on filtered data
  const totalBookings = filteredBookings.length;
  const confirmedBookings = filteredBookings.filter((b) => b.status === 'confirmed').length;
  const totalSpend = filteredBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalVolume = totalSpend + totalExpenses;
  const avgBookingPrice = totalBookings > 0 ? totalSpend / totalBookings : 0;

  // Pie Chart Data
  const bookingsByTypeRaw = filteredBookings.reduce((acc: Record<string, number>, booking) => {
    acc[booking.type] = (acc[booking.type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(bookingsByTypeRaw).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Bar Chart Data
  const expensesByCategoryRaw = filteredExpenses.reduce((acc: Record<string, number>, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const barData = Object.entries(expensesByCategoryRaw).map(([category, amount]) => ({
    category: category.toUpperCase(),
    amount
  })).sort((a, b) => b.amount - a.amount);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 sm:p-8 space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 px-1">Global Terminal Analytics</p>
          <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight" style={{ fontFamily: 'Syne' }}>System Reports</h1>
        </div>
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
           <button 
             onClick={() => setTimeframe('all')}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === 'all' ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-zinc-400 hover:text-zinc-600'}`}
           >All Time</button>
           <button 
             onClick={() => setTimeframe('30d')}
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === '30d' ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-zinc-400 hover:text-zinc-600'}`}
           >Last 30 Days</button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: `${currencySymbol}${totalVolume.toLocaleString()}`, sub: 'Spend + Expenses', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-black text-white', type: 'expenses', items: [...filteredBookings, ...filteredExpenses] },
          { label: 'Confirmed Bookings', value: confirmedBookings, sub: `${totalBookings} Total Requests`, icon: <BarChart3 className="w-5 h-5" />, color: 'bg-white text-black', type: 'bookings', items: filteredBookings.filter(b => b.status === 'confirmed') },
          { label: 'Average Value', value: `${currencySymbol}${avgBookingPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: 'Per reservation', icon: <DollarSign className="w-5 h-5" />, color: 'bg-white text-black', type: 'bookings', items: filteredBookings },
          { label: 'Active Trips', value: filteredTrips.length, sub: 'Planned itineraries', icon: <Calendar className="w-5 h-5" />, color: 'bg-white text-black', type: 'trips', items: filteredTrips },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            onClick={() => setDetailModal({ title: stat.label, type: stat.type as any, items: stat.items })}
            className={`${stat.color} p-6 rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-black/5 flex flex-col justify-between min-h-[170px] cursor-pointer group active:scale-95 transition-all outline-none focus-visible:ring-2 ring-black`}
          >
            <div className="flex justify-between items-start z-10">
               <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${stat.color.includes('white') ? 'text-zinc-400' : 'text-zinc-500'}`}>{stat.label}</p>
                  <p className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'Syne' }}>{stat.value}</p>
               </div>
               <div className={`p-2 rounded-xl border ${stat.color.includes('white') ? 'bg-zinc-50 border-zinc-100 text-black' : 'bg-zinc-800 border-zinc-700 text-white'}`}>{stat.icon}</div>
            </div>
            <div className="mt-4 flex items-center justify-between z-10">
               <span className={`text-[10px] font-bold ${stat.color.includes('white') ? 'text-zinc-400' : 'text-zinc-500'}`}>{stat.sub}</span>
               <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${stat.color.includes('white') ? 'border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white' : 'border-zinc-700 group-hover:bg-white group-hover:text-black'} transition-all`}>
                  <ArrowUpRight className="w-3 h-3" />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-xl font-black text-black uppercase tracking-tight" style={{ fontFamily: 'Syne' }}>Expense Distribution</h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Spend by Category ({timeframe === 'all' ? 'All Time' : 'Last 30 Days'})</p>
             </div>
             <Filter className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="h-[350px] w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 10, fontWeight: 900, fill: '#000' }} />
                  <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                  <Bar dataKey="amount" fill="#000" radius={[0, 10, 10, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                 <DollarSign className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-xs font-bold uppercase tracking-widest">No expenses recorded</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4 bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-black/20 relative">
          <div className="mb-8">
             <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: 'Syne' }}>Inventory Mix</h3>
             <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Bookings by Type</p>
          </div>
          <div className="h-[250px] w-full relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#fff' : index === 1 ? '#52525b' : index === 2 ? '#27272a' : '#000'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#000', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                <PieIcon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No bookings yet</p>
              </div>
            )}
            {pieData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-2xl font-black" style={{ fontFamily: 'Syne' }}>{totalBookings}</span>
                 <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Total</span>
              </div>
            )}
          </div>
          <div className="mt-8 space-y-3">
             {pieData.map((item, idx) => (
               <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-zinc-700'}`} />
                     <span className="text-[10px] font-black uppercase tracking-wider">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500">{Math.round((item.value / totalBookings) * 100)}%</span>
               </div>
             ))}
          </div>
        </motion.div>
      </div>

      {/* Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { status: 'confirmed', label: 'APPROVED', color: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-green-500' },
          { status: 'pending', label: 'PENDING', color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
          { status: 'in-review', label: 'IN-REVIEW', color: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
          { status: 'cancelled', label: 'VOIDED', color: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500' },
        ].map((item, i) => {
          const count = filteredBookings.filter(b => b.status === item.status).length;
          return (
            <motion.div key={i} variants={itemVariants} className={`p-6 rounded-[2rem] border ${item.color} flex flex-col justify-between h-[140px]`}>
              <div className="flex items-center gap-2 mb-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                 <span className="text-[9px] font-black tracking-widest uppercase opacity-80">{item.label}</span>
              </div>
              <div>
                 <p className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'Syne' }}>{count}</p>
                 <div className="w-full bg-black/5 rounded-full h-1 mt-3">
                    <div className={`h-full rounded-full transition-all duration-1000 ${item.dot}`} style={{ width: `${totalBookings > 0 ? (count / totalBookings) * 100 : 0}%` }} />
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Drill-down Detail Modal */}
      <AnimatePresence>
        {detailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setDetailModal(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white border border-zinc-200 rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl relative z-10"
             >
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Syne' }}>{detailModal.title}</h2>
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Detailed Log ({timeframe === 'all' ? 'All Time' : 'Last 30 Days'})</p>
                   </div>
                   <button onClick={() => setDetailModal(null)} className="p-2 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-4">
                   {detailModal.items.length === 0 ? (
                      <div className="text-center py-20 text-zinc-400 font-bold uppercase text-xs tracking-widest">No data available for this selection.</div>
                   ) : (
                      detailModal.items.map((item, idx) => (
                        <div key={idx} className="p-5 bg-zinc-50 rounded-3xl border border-zinc-100 hover:border-black transition-all group">
                           <div className="flex justify-between items-center">
                              <div>
                                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{item.type || item.category || 'Entry'}</p>
                                 <p className="font-black text-black group-hover:translate-x-1 transition-transform">{item.name || item.property || item.title || item.clientName || 'General Item'}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-lg font-black">{currencySymbol}{(item.price || item.amount || 0).toLocaleString()}</p>
                                 <p className="text-[9px] font-bold text-zinc-400 uppercase">{new Date(item.created_at || item.date || Date.now()).toLocaleDateString()}</p>
                              </div>
                           </div>
                        </div>
                      ))
                   )}
                </div>
                <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-center">
                   <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.3em]">End of Audit Trail</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
