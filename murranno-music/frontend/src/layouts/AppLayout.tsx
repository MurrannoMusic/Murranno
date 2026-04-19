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
      <div className="">
        {children || <Outlet />}
      </div>
    </PageContainer>
  );
};
