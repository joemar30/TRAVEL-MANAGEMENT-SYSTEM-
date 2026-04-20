import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Mail, Lock, ArrowRight, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password/check', { email });
      setQuestion(data.question);
      setStep(2);
      toast.success('Security question found');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Email not found or no security question set');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer) {
      toast.error('Please provide an answer');
      return;
    }
    // Proceed to reset password step, actual verification is done in the reset endpoint
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password/reset', { 
        email, 
        answer, 
        newPassword 
      });
      toast.success(data.message || 'Password reset successfully');
      setLocation('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
      if (err.response?.status === 401) {
        // If answer was wrong, go back to step 2
        setStep(2);
      }
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
            Travel Booking System
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: 'Syne' }}>
              Recover Account
            </h2>
            <p className="text-muted-foreground text-sm">
              {step === 1 && "Enter your email to verify your identity"}
              {step === 2 && "Answer your security question"}
              {step === 3 && "Create a new password"}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleCheckEmail} className="space-y-4">
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
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-6 rounded-xl transition-all"
              >
                {loading ? 'Checking...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAnswer} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <HelpCircle className="w-4 h-4 inline mr-2" />
                  Security Question
                </label>
                <div className="w-full px-4 py-3 mb-4 bg-muted border border-border rounded-xl text-foreground font-medium">
                  {question}
                </div>
                
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Your Answer
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your security answer"
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  required
                />
              </div>
              <div className="flex gap-3">
                 <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 py-6 rounded-xl transition-all border-border"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-black hover:bg-zinc-800 text-white font-bold py-6 rounded-xl transition-all"
                >
                  Continue
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 mb-4 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  required
                />

                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm New Password
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
              <div className="flex gap-3">
                 <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => setStep(2)}
                  className="flex-1 py-6 rounded-xl transition-all border-border"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black hover:bg-zinc-800 text-white font-bold py-6 rounded-xl transition-all"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
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
