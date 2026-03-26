import { useWayfarerStore } from '@/lib/store';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

export default function Reports() {
  const { bookings, expenses, trips } = useWayfarerStore();

  // Calculate statistics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const totalSpend = bookings.reduce((sum, b) => sum + b.price, 0) + expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgBookingPrice = totalBookings > 0 ? totalSpend / totalBookings : 0;

  // Expense breakdown by category
  const expensesByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Booking breakdown by type
  const bookingsByType = bookings.reduce((acc: Record<string, number>, booking) => {
    acc[booking.type] = (acc[booking.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8 space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Bookings</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalBookings}</p>
              <p className="text-accent text-xs font-medium mt-2">
                {confirmedBookings} confirmed
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Spend</p>
              <p className="text-3xl font-bold text-foreground mt-2">${totalSpend.toLocaleString()}</p>
              <p className="text-accent text-xs font-medium mt-2">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Across all trips
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Avg Booking Cost</p>
              <p className="text-3xl font-bold text-foreground mt-2">${avgBookingPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-accent text-xs font-medium mt-2">
                Per booking
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Trips</p>
              <p className="text-3xl font-bold text-foreground mt-2">{trips.length}</p>
              <p className="text-accent text-xs font-medium mt-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Planned
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Type */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-6" style={{ fontFamily: 'Syne' }}>
            Bookings by Type
          </h3>
          <div className="space-y-4">
            {Object.entries(bookingsByType).map(([type, count]: [string, unknown]) => {
              const countNum = count as number;
              const percentage = (countNum / totalBookings) * 100;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground capitalize">{type}</p>
                    <p className="text-sm font-bold text-accent">{countNum}</p>
                  </div>
                  <div className="w-full bg-card/50 rounded-full h-2">
                    <div
                      className="bg-accent rounded-full h-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-6" style={{ fontFamily: 'Syne' }}>
            Expenses by Category
          </h3>
          <div className="space-y-4">
            {Object.entries(expensesByCategory).map(([category, amount]: [string, unknown]) => {
              const amountNum = amount as number;
              const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
              const percentage = (amountNum / totalExpenses) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground capitalize">{category}</p>
                    <p className="text-sm font-bold text-accent">${amountNum}</p>
                  </div>
                  <div className="w-full bg-card/50 rounded-full h-2">
                    <div
                      className="bg-accent rounded-full h-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-6" style={{ fontFamily: 'Syne' }}>
          Booking Status Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['confirmed', 'pending', 'in-review', 'cancelled'].map((status: string) => {
            const count = bookings.filter((b: typeof bookings[0]) => b.status === status).length;
            const statusColors: Record<string, string> = {
              confirmed: 'bg-green-500/10 text-green-400',
              pending: 'bg-amber-500/10 text-amber-400',
              'in-review': 'bg-purple-500/10 text-purple-400',
              cancelled: 'bg-red-500/10 text-red-400',
            };
            return (
              <div key={status} className={`p-4 rounded-lg ${statusColors[status]}`}>
                <p className="text-xs font-semibold uppercase mb-2">{status}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
