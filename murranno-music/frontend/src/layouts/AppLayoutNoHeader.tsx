import { Outlet } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';

export const AppLayoutNoHeader = () => (
  <PageContainer showHeader={false}>
    <Outlet />
  </PageContainer>
);
