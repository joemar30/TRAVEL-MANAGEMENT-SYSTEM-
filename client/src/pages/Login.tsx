import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useTravelStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useTravelStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      setLocation('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
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
            TRAVEL
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Travel Booking System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'Syne' }}>
              Welcome Back
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign in to your administration dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@tms.com"
                className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                required
              />
            </div>

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
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="text-sm font-semibold text-muted-foreground hover:text-black hover:underline transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-6 rounded-xl transition-all"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <footer className="space-y-4 pt-2">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/register" className="text-black font-bold hover:underline inline-flex items-center gap-1">
                  Create One <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
