import { useState } from 'react';
import { useTravelStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, User, X, Save, FileUp } from 'lucide-react';
import { toast } from 'sonner';

interface TravelerFormData {
  name: string;
  email: string;
  passportNumber: string;
  seatPreference: string;
  loyaltyProgram: string;
  loyaltyNumber: string;
}

const emptyForm: TravelerFormData = {
  name: '',
  email: '',
  passportNumber: '',
  seatPreference: 'Window',
  loyaltyProgram: '',
  loyaltyNumber: '',
};

export default function Travelers() {
  const { travelers, addTraveler, updateTraveler, deleteTraveler } = useTravelStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TravelerFormData>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (travelerId: string) => {
    const traveler = travelers.find((t) => t.id === travelerId);
    if (!traveler) return;
    const loyaltyEntries = Object.entries(traveler.loyaltyNumbers || {});
    setEditingId(travelerId);
    setForm({
      name: traveler.name,
      email: traveler.email,
      passportNumber: traveler.passportNumber || '',
      seatPreference: traveler.seatPreference || 'Window',
      loyaltyProgram: loyaltyEntries[0]?.[0] || '',
      loyaltyNumber: loyaltyEntries[0]?.[1] || '',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    const loyaltyNumbers: Record<string, string> = {};
    if (form.loyaltyProgram.trim() && form.loyaltyNumber.trim()) {
      loyaltyNumbers[form.loyaltyProgram.trim()] = form.loyaltyNumber.trim();
    }

    const travelerData = {
      name: form.name.trim(),
      email: form.email.trim(),
      passportNumber: form.passportNumber.trim() || undefined,
      seatPreference: form.seatPreference || undefined,
      loyaltyNumbers: Object.keys(loyaltyNumbers).length > 0 ? loyaltyNumbers : undefined,
    };

    if (editingId) {
      updateTraveler(editingId, travelerData);
      toast.success('Traveler updated successfully');
    } else {
      addTraveler({
        ...travelerData,
        id: 'traveler-' + Date.now(),
        userId: 'user-demo-client',
      });
      toast.success('Traveler added successfully');
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteTraveler(id);
    setShowDeleteConfirm(null);
    toast.success('Traveler removed');
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    let count = 0;

    // Skip header and process rows
    rows.slice(1).forEach(row => {
      if (row.length >= 2 && row[0].trim() && row[1].trim()) {
        addTraveler({
          id: 'traveler-' + Date.now() + Math.random(),
          name: row[0].trim(),
          email: row[1].trim(),
          passportNumber: row[2]?.trim() || undefined,
          userId: 'user-demo-client',
        });
        count++;
      }
    });

    if (count > 0) {
      toast.success(`${count} travelers imported successfully!`);
    } else {
      toast.error('Invalid CSV format. Expected: Name, Email, Passport');
    }
    e.target.value = ''; // Reset
  };

  return (
    <div className="p-8 space-y-6">
      <input 
        type="file" 
        id="csv-import" 
        accept=".csv" 
        className="hidden" 
        onChange={handleCSVImport}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Total travelers: {travelers.length}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => document.getElementById('csv-import')?.click()} 
            variant="outline" 
            className="border-black text-black hover:bg-gray-50"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Bulk Import (CSV)
          </Button>
          <Button onClick={openAddModal} className="bg-black hover:bg-gray-900 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Traveler
          </Button>
        </div>
      </div>

      {/* Travelers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {travelers.map((traveler) => (
          <div key={traveler.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {traveler.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditModal(traveler.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {showDeleteConfirm === traveler.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(traveler.id)}
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
                    onClick={() => setShowDeleteConfirm(traveler.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                  {traveler.name}
                </h3>
                <p className="text-sm text-muted-foreground">{traveler.email}</p>
              </div>

              {/* Details */}
              <div className="space-y-2 pt-3 border-t border-border">
                {traveler.passportNumber && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Passport</p>
                    <p className="text-sm text-foreground">{traveler.passportNumber}</p>
                  </div>
                )}

                {traveler.seatPreference && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Seat Preference</p>
                    <p className="text-sm text-foreground">{traveler.seatPreference}</p>
                  </div>
                )}

                {traveler.loyaltyNumbers && Object.keys(traveler.loyaltyNumbers).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Loyalty Numbers</p>
                    <div className="space-y-1">
                      {Object.entries(traveler.loyaltyNumbers).map(([program, number]) => (
                        <p key={program} className="text-sm text-foreground">
                          <span className="font-medium">{program}:</span> {String(number)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {travelers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No travelers added yet</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                {editingId ? 'Edit Traveler' : 'Add Traveler'}
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
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Passport Number</label>
                <input
                  type="text"
                  value={form.passportNumber}
                  onChange={(e) => setForm({ ...form, passportNumber: e.target.value })}
                  placeholder="AB123456"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Seat Preference</label>
                <select
                  value={form.seatPreference}
                  onChange={(e) => setForm({ ...form, seatPreference: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                >
                  <option value="Window">Window</option>
                  <option value="Aisle">Aisle</option>
                  <option value="Middle">Middle</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Loyalty Program</label>
                  <input
                    type="text"
                    value={form.loyaltyProgram}
                    onChange={(e) => setForm({ ...form, loyaltyProgram: e.target.value })}
                    placeholder="e.g. United"
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Member Number</label>
                  <input
                    type="text"
                    value={form.loyaltyNumber}
                    onChange={(e) => setForm({ ...form, loyaltyNumber: e.target.value })}
                    placeholder="UA123456"
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button onClick={handleSubmit} className="flex-1 bg-black hover:bg-gray-900 text-white">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Add Traveler'}
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
