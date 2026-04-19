import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
        navigate('/signup');
        return;
      }

      // Skip subscription checks in development mode
      if (IS_DEV_MODE) {
        return;
      }

      // Check if required tier is accessible
      if (requiredTier && !accessibleTiers.includes(requiredTier)) {
        // User doesn't have access to this tier
        // Check if they have an expired subscription for this tier
        const tierSub = subscriptions.find(sub => sub.tier === requiredTier);

        if (tierSub && (tierSub.status === 'expired' || tierSub.status === 'cancelled')) {
          navigate('/app/subscription/plans');
          return;
        }

        // Otherwise redirect to artist dashboard (always accessible)
        navigate('/app/artist-dashboard');
      }
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

  return <>{children}</>;
};
