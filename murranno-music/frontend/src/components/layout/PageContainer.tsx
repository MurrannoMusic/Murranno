import { BottomNavigation, DesktopSidebar } from '@/components/mobile/BottomNavigation';
import { AppHeader } from './AppHeader';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

// Phones: bottom tab bar. Desktop (lg+): fixed sidebar, content offset beside it.
export const PageContainer = ({ children, className = "", showHeader = true }: PageContainerProps) => {
  return (
    <div className={`min-h-screen bg-background mobile-safe-bottom lg:pb-0 overflow-x-hidden max-w-full ${className}`}>
      <DesktopSidebar />
      <div className="lg:pl-64">
        {showHeader && <AppHeader />}
        <div className={showHeader ? "pt-14" : ""}>
          {children}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};
