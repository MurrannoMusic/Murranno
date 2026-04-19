import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const DashboardRedirect = () => {
  const { loading, accessibleTiers, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Check for admin first
      if (userRole?.tier === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      // Get last viewed dashboard from localStorage
      const lastViewed = localStorage.getItem('lastViewedDashboard') as 'artist' | 'label' | 'agency' | null;

      // If we have a last viewed dashboard and user has access, go there
      if (lastViewed && accessibleTiers.includes(lastViewed)) {
        const dashboardMap = {
          artist: '/app/dashboard',
          label: '/app/label-dashboard',
          agency: '/app/agency-dashboard',
        };
        navigate(dashboardMap[lastViewed], { replace: true });
      } else {
        // Default to artist dashboard (now main dashboard)
        navigate('/app/dashboard', { replace: true });
      }
    }
  }, [loading, accessibleTiers, userRole, navigate]);

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

  return null;
};
