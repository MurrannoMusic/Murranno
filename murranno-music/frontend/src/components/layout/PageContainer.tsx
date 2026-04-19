import { BottomNavigation } from '@/components/mobile/BottomNavigation';
import { AppHeader } from './AppHeader';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

export const PageContainer = ({ children, className = "", showHeader = true }: PageContainerProps) => {
  return (
    <div className={`min-h-screen bg-gradient-mesh mobile-safe-bottom overflow-x-hidden max-w-full ${className}`}>
      {showHeader && <AppHeader />}
      <div className={showHeader ? "pt-14" : ""}>
        {children}
      </div>
      <BottomNavigation />
    </div>
  );
};