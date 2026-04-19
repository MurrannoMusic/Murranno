import { Home, Upload, Megaphone, DollarSign, BarChart3, Users, TrendingUp, Music } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserType } from '@/hooks/useUserType';

export const BottomNavigation = () => {
  const location = useLocation();
  const { currentViewingTier } = useUserType();

  // Dynamic navigation based on current viewing tier
  const getNavItems = () => {
    if (currentViewingTier === 'artist') {
      return [
        { icon: Home, label: 'Home', path: '/app/dashboard' },
        { icon: BarChart3, label: 'Analytics', path: '/app/analytics' },
        { icon: Music, label: 'Music', path: '/app/releases' },
        { icon: DollarSign, label: 'Earnings', path: '/app/earnings' },
        { icon: Upload, label: 'Upload', path: '/app/upload' },
      ];
    }

    if (currentViewingTier === 'label') {
      return [
        { icon: Home, label: 'Home', path: '/app/label-dashboard' },
        { icon: Users, label: 'Artists', path: '/app/artist-management' },
        { icon: Upload, label: 'Upload', path: '/app/upload' },
        { icon: DollarSign, label: 'Payouts', path: '/app/payout-manager' },
        { icon: TrendingUp, label: 'Analytics', path: '/app/label-analytics' },
      ];
    }

    if (currentViewingTier === 'agency') {
      return [
        { icon: Home, label: 'Home', path: '/app/agency-dashboard' },
        { icon: Megaphone, label: 'Campaigns', path: '/app/campaign-tracking' },
        { icon: Upload, label: 'Create', path: '/app/promotions' },
        { icon: BarChart3, label: 'Results', path: '/app/results' },
      ];
    }

    // Default fallback
    return [{ icon: Home, label: 'Home', path: '/app/dashboard' }];
  };

  const navItems = getNavItems();

  return (
    <nav className="glass-nav fixed bottom-0 left-0 right-0 z-40 shadow-soft pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-evenly py-3 px-4 w-full mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "nav-item flex flex-col items-center gap-1 p-2 rounded-xl flex-1",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-elastic",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};