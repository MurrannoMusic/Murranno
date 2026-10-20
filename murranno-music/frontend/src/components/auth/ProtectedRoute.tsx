import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionDenied } from '@/components/states/StateViews';
import { getAppStatus } from '@/lib/appStatus';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredTier?: 'artist' | 'label' | 'agency';
}

// Set to false when ready to enforce subscription restrictions
const IS_DEV_MODE = false;

export const ProtectedRoute = ({ children, requiredTier }: ProtectedRouteProps) => {
  const { user, accessibleTiers, subscriptions, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // An expired session goes back to login (with a notice) and returns here afterwards.
        navigate(getAppStatus().sessionExpired ? `/login?reason=expired&next=${encodeURIComponent(location.pathname + location.search)}` : '/signup');
        return;
      }

      // Skip subscription checks in development mode
      if (IS_DEV_MODE) {
        return;
      }

      // Missing tier access is explained on the page (below) rather than redirected away.
    }
  }, [user, accessibleTiers, subscriptions, loading, requiredTier, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!IS_DEV_MODE && requiredTier && !accessibleTiers.includes(requiredTier)) {
    const tierSub = subscriptions.find((sub) => sub.tier === requiredTier);
    const lapsed = tierSub && (tierSub.status === 'expired' || tierSub.status === 'cancelled');
    const name = requiredTier === 'label' ? 'Label' : requiredTier === 'agency' ? 'Agency' : 'Artist';
    return lapsed
      ? <PermissionDenied title={`Your ${name} subscription has ended`} body={`Renew ${name} Access to manage this area again. Your data is safe and waiting for you.`} action={{ label: 'Renew subscription', to: '/app/subscription/plans' }} secondary={{ label: 'Go to dashboard', to: '/app/dashboard' }} />
      : <PermissionDenied title={`This area is for ${name} accounts`} body={`Add ${name} Access to your account to use these tools.`} action={{ label: 'See plans', to: '/app/subscription/plans' }} secondary={{ label: 'Go to dashboard', to: '/app/dashboard' }} />;
  }

  return <>{children}</>;
};
