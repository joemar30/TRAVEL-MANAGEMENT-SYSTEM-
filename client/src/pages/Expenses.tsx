import { useState } from 'react';
import { useWayfarerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, X, Save, DollarSign, Filter, Search } from 'lucide-react';
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

interface ExpenseFormData {
  tripId: string;
  category: string;
  amount: string;
  date: string;
  description: string;
}

const emptyForm: ExpenseFormData = {
  tripId: '',
  category: 'meals',
  amount: '',
  date: '',
  description: '',
};

export default function Expenses() {
  const { expenses, trips, addExpense, updateExpense, deleteExpense } = useWayfarerStore();
  const [filterTrip, setFilterTrip] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ExpenseFormData>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredExpenses = expenses.filter((expense) => {
    if (filterTrip !== 'all' && expense.tripId !== filterTrip) return false;
    return true;
  });

  const getTripName = (tripId?: string) => {
    if (!tripId) return 'General';
    return trips.find((t) => t.id === tripId)?.destination || 'Unknown Trip';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meals':
        return 'bg-blue-100 text-blue-700';
      case 'activities':
        return 'bg-purple-100 text-purple-700';
      case 'transport':
        return 'bg-green-100 text-green-700';
      case 'accommodation':
        return 'bg-orange-100 text-orange-700';
      case 'shopping':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (expenseId: string) => {
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) return;
    setEditingId(expenseId);
    setForm({
      tripId: expense.tripId || '',
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      description: expense.description,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!form.date) {
      toast.error('Please select a date');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const expenseData = {
      tripId: form.tripId || undefined,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      description: form.description.trim(),
    };

    if (editingId) {
      updateExpense(editingId, expenseData);
      toast.success('Expense updated successfully');
    } else {
      addExpense({
        ...expenseData,
        id: 'exp-' + Date.now(),
        userId: 'user-demo-client',
      });
      toast.success('Expense added successfully');
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    setShowDeleteConfirm(null);
    toast.success('Expense deleted');
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            Total expenses: {CURRENCY_SYMBOLS[useWayfarerStore.getState().settings.currency as keyof typeof CURRENCY_SYMBOLS] || '$'}
            {totalExpenses.toLocaleString()}
          </p>
        </div>
        <Button onClick={openAddModal} className="bg-black hover:bg-gray-900 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 bg-card border border-border px-4 py-3 rounded-xl shadow-sm w-fit">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground tracking-tight">Filter by Trip:</span>
        <select
          value={filterTrip}
          onChange={(e) => setFilterTrip(e.target.value)}
          className="bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer border-l border-border pl-3 ml-1 pr-6 hover:text-black transition-colors"
        >
          <option value="all">All Trips</option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.destination}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Trip</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Amount</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="border-b border-border hover:bg-card/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">
                    {new Date(expense.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{getTripName(expense.tripId)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{expense.description}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">${expense.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(expense.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {showDeleteConfirm === expense.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(expense.id)}
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
                          onClick={() => setShowDeleteConfirm(expense.id)}
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

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No expenses found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                {editingId ? 'Edit Expense' : 'Add Expense'}
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
                <label className="block text-sm font-medium text-foreground mb-2">Trip</label>
                <select
                  value={form.tripId}
                  onChange={(e) => setForm({ ...form, tripId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                >
                  <option value="">General (no trip)</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>{trip.destination}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                >
                  <option value="meals">Meals</option>
                  <option value="transport">Transport</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="activities">Activities</option>
                  <option value="shopping">Shopping</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Amount ($)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What was this expense for?"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button onClick={handleSubmit} className="flex-1 bg-black hover:bg-gray-900 text-white">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Add Expense'}
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
