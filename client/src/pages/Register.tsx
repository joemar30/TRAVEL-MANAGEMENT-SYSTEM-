import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useWayfarerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [, setLocation] = useLocation();
  const { register } = useWayfarerStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password, role);
      toast.success('Account created successfully!');
      setLocation('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 flex items-center justify-center overflow-hidden rounded-full bg-black">
            <img src="/favicon-tms.png" className="w-full h-full object-cover rounded-full" alt="TMS Logo" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground" style={{ fontFamily: 'Syne' }}>
            TMS
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Travel Management System
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'Syne' }}>
              Create Account
            </h2>
            <p className="text-muted-foreground text-sm">
               Register for a new TMS account
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex gap-2 p-1 bg-input border border-border rounded-xl">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'client' ? 'bg-white shadow-sm text-black' : 'text-muted-foreground hover:text-black'}`}
                onClick={() => setRole('client')}
              >
                <UserIcon className="w-4 h-4" /> Client
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-white shadow-sm text-black' : 'text-muted-foreground hover:text-black'}`}
                onClick={() => setRole('admin')}
              >
                <Lock className="w-4 h-4" /> Admin
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <UserIcon className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-6 rounded-xl transition-all"
            >
              {loading ? 'Creating Account...' : 'Register Now'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-black font-bold hover:underline inline-flex items-center gap-1">
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
