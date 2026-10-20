import { Home, Upload, Megaphone, DollarSign, BarChart3, Users, TrendingUp, Music, Settings, User, LifeBuoy, Link2, Send } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserType } from '@/hooks/useUserType';
import mmLogo from '@/assets/mm_logo.png';

// Same tabs as the Expo app; the desktop sidebar shows these plus the account links.
const useNavItems = () => {
  const { currentViewingTier } = useUserType();
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
  return [
    { icon: Home, label: 'Home', path: '/app/dashboard' },
    { icon: BarChart3, label: 'Analytics', path: '/app/analytics' },
    { icon: Music, label: 'Music', path: '/app/releases' },
    { icon: DollarSign, label: 'Earnings', path: '/app/earnings' },
    { icon: Upload, label: 'Upload', path: '/app/upload' },
  ];
};

export const TOOL_ITEMS = [
  { icon: Link2, label: 'Smart Link', path: '/app/tools/smart-link' },
  { icon: Send, label: 'Pitch', path: '/app/tools/pitch' },
  { icon: Megaphone, label: 'Promotions', path: '/app/promotions' },
];

const ACCOUNT_ITEMS = [
  { icon: User, label: 'Artist profile', path: '/app/profile' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
  { icon: LifeBuoy, label: 'Support', path: '/support' },
];

const isActivePath = (current: string, path: string) => current === path || current.startsWith(`${path}/`);

export const BottomNavigation = () => {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Main" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch h-16 max-w-3xl mx-auto">
        {useNavItems().map(({ icon: Icon, label, path }) => {
          const active = isActivePath(pathname, path);
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-6 w-6" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export const DesktopSidebar = () => {
  const { pathname } = useLocation();
  const item = ({ icon: Icon, label, path }: { icon: typeof Home; label: string; path: string }) => {
    const active = isActivePath(pathname, path);
    return (
      <Link
        key={path}
        to={path}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
        )}
      >
        <Icon className={cn('h-5 w-5', active && 'text-primary')} />
        {label}
      </Link>
    );
  };
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col overflow-y-auto border-r border-border bg-sidebar px-4 py-6">
      <Link to="/app" className="px-3 mb-8">
        <img src={mmLogo} alt="Murranno Music" className="h-9" />
      </Link>
      <nav aria-label="Main" className="flex flex-col gap-1">{useNavItems().map(item)}</nav>
      <nav aria-label="Tools" className="mt-6 flex flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tools</p>
        {TOOL_ITEMS.map(item)}
      </nav>
      <nav aria-label="Account" className="mt-auto flex flex-col gap-1 border-t border-border pt-4">{ACCOUNT_ITEMS.map(item)}</nav>
    </aside>
  );
};
