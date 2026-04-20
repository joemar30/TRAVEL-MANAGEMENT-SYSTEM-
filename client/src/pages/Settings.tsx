import { useState } from 'react';
import { useTravelStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Bell, Lock, Palette, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { settings, updateSettings, updateNotificationSettings, logout } = useTravelStore();
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [currency, setCurrency] = useState(settings.currency);
  const [budgetThreshold, setBudgetThreshold] = useState(settings.budgetThreshold);
  const [theme, setTheme] = useState(settings.theme);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveGeneral = () => {
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    updateSettings({
      companyName: companyName.trim(),
      currency,
      budgetThreshold,
    });
    toast.success('General settings saved');
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleNotificationToggle = (key: string, value: boolean) => {
    updateNotificationSettings(key, value);
    toast.success('Notification setting updated');
  };

  const handleDeleteAccount = () => {
    toast.success('Account deleted (demo)');
    setShowDeleteConfirm(false);
    logout();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl space-y-6">
        {/* General Settings */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
              General
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="PHP">PHP (₱)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Budget Alert Threshold
              </label>
              <input
                type="number"
                value={budgetThreshold}
                onChange={(e) => setBudgetThreshold(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>

            <div className="pt-2">
              <Button onClick={handleSaveGeneral} className="bg-black hover:bg-gray-900 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save General Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
              Notifications
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { key: 'bookingConfirmations', label: 'Booking confirmations' },
              { key: 'approvalRequests', label: 'Approval requests' },
              { key: 'budgetAlerts', label: 'Budget alerts' },
              { key: 'tripReminders', label: 'Trip reminders' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-foreground group-hover:text-black transition-colors">{item.label}</span>
                <input
                  type="checkbox"
                  checked={(settings.notifications as Record<string, boolean>)[item.key] ?? false}
                  onChange={(e) => handleNotificationToggle(item.key, e.target.checked)}
                  className="w-5 h-5 accent-black"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
              Security
            </h3>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info('Change password from your Profile page')}
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.success('Two-Factor Authentication enabled (demo)')}
            >
              <Lock className="w-4 h-4 mr-2" />
              Two-Factor Authentication
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info('1 active session (current)')}
            >
              <Lock className="w-4 h-4 mr-2" />
              Active Sessions
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
              Appearance
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Theme
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-black text-white shadow-md'
                      : 'bg-card border border-border text-foreground hover:border-black'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-black text-white shadow-md'
                      : 'bg-card border border-border text-foreground hover:border-black'
                  }`}
                >
                  Light
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-8">
          <h3 className="text-lg font-bold text-destructive mb-4" style={{ fontFamily: 'Syne' }}>
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </Button>
          ) : (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-destructive">
                Are you sure? This will permanently delete your account.
              </p>
              <div className="flex gap-3">
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Yes, Delete My Account
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
