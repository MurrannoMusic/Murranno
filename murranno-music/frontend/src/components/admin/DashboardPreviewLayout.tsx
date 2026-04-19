import { ReactNode } from 'react';
import { PreviewBanner } from './PreviewBanner';

interface DashboardPreviewLayoutProps {
  children: ReactNode;
  dashboardType: 'Artist' | 'Label' | 'Agency';
}

export const DashboardPreviewLayout = ({ children, dashboardType }: DashboardPreviewLayoutProps) => {
  return (
    <div className="min-h-screen w-full">
      <PreviewBanner dashboardType={dashboardType} />
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
