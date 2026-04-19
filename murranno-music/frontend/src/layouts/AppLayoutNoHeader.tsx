import { Outlet } from 'react-router-dom';
import { BottomNavigation } from '@/components/mobile/BottomNavigation';

export const AppLayoutNoHeader = () => {
  return (
    <div className="min-h-screen bg-gradient-mesh mobile-safe-bottom overflow-x-hidden max-w-full">
      <Outlet />
      <BottomNavigation />
    </div>
  );
};
