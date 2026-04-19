import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { shouldShowMobileRoutes } from '@/utils/platformDetection';

interface MobileOnlyRouteProps {
  children: ReactNode;
}

export const MobileOnlyRoute = ({ children }: MobileOnlyRouteProps) => {
  // Synchronous detection - no delay!
  const shouldShow = shouldShowMobileRoutes();

  if (!shouldShow) {
    return <Navigate to="/desktop" replace />;
  }

  return <>{children}</>;
};
