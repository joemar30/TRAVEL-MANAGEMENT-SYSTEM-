import { useWayfarerStore, UserRole } from '@/lib/store';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useWayfarerStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: 'Syne' }}>
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            You don't have permission to access this page.
            {user.role === 'client' && (
              <><br />This section is only available to administrators.</>
            )}
          </p>
          <Button
            onClick={() => setLocation('/')}
            className="bg-black hover:bg-gray-900 text-white px-6 py-2.5"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
