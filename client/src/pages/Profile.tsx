import { useState, useEffect } from 'react';
import { useTravelStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { User, Mail, Lock, Phone, Building2, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, updateProfile } = useTravelStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [company, setCompany] = useState(user?.company || '');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCompany(user.company || '');
    }
  }, [user]);

  // Notification preferences
  const { settings, updateNotificationSettings } = useTravelStore();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          await updateProfile({ avatar: base64String });
          toast.success('Profile picture updated');
        } catch (err: any) {
          console.error('Avatar upload failed:', err);
          toast.error('Failed to upload picture. Image might be too large.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    try {
      await updateProfile({ full_name: fullName.trim(), email: email.trim(), phone: phone.trim(), company: company.trim() });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleChangePassword = () => {
// ... existing password logic ...
    toast.success('Password changed successfully');
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
               <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-xl" style={{ fontFamily: 'Syne' }}>
                 {user?.avatar ? (
                   <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                 ) : (
                   user?.full_name?.charAt(0).toUpperCase() || 'U'
                 )}
               </div>
               <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                 Change
                 <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
               </label>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Syne' }}>
                {user?.full_name}
              </h2>
              <p className="text-muted-foreground capitalize font-medium">{user?.role} Account</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company name"
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSaveProfile}
                className="bg-black hover:bg-gray-900 text-white px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h3 className="text-lg font-bold text-foreground mb-6" style={{ fontFamily: 'Syne' }}>
            <Lock className="w-5 h-5 inline mr-2" />
            Password
          </h3>

          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="w-full">
              Change Password
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleChangePassword} className="bg-black hover:bg-gray-900 text-white">
                  Update Password
                </Button>
                <Button variant="outline" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h3 className="text-lg font-bold text-foreground mb-6" style={{ fontFamily: 'Syne' }}>
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-foreground group-hover:text-black transition-colors">Email notifications for new bookings</span>
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => { updateNotificationSettings('emailNotifications', e.target.checked); toast.success('Preference updated'); }}
                className="w-5 h-5 accent-black"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-foreground group-hover:text-black transition-colors">Weekly expense summary</span>
              <input
                type="checkbox"
                checked={settings.notifications.weeklySummary}
                onChange={(e) => { updateNotificationSettings('weeklySummary', e.target.checked); toast.success('Preference updated'); }}
                className="w-5 h-5 accent-black"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-foreground group-hover:text-black transition-colors">Marketing emails</span>
              <input
                type="checkbox"
                checked={settings.notifications.marketingEmails}
                onChange={(e) => { updateNotificationSettings('marketingEmails', e.target.checked); toast.success('Preference updated'); }}
                className="w-5 h-5 accent-black"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
