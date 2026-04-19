import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border/50 flex items-center px-6 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center justify-between flex-1">
              <h1 className="text-lg font-semibold text-foreground">Admin Control Panel</h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-primary/15 text-primary text-xs font-semibold rounded-full">
                  Super Admin
                </span>
                <AvatarDropdown />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};