import { Outlet } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { UnifiedTopBar } from '@/components/layout/UnifiedTopBar';
import { GlobalAnnouncementBanner } from "@/components/GlobalAnnouncementBanner";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <PageContainer showHeader={false}>
      <UnifiedTopBar />
      <GlobalAnnouncementBanner />
      {/* Pages are built mobile-first; on wide screens they sit in a centred column like the Expo app. */}
      <div className="w-full max-w-3xl mx-auto pt-2">
        {children || <Outlet />}
      </div>
    </PageContainer>
  );
};
