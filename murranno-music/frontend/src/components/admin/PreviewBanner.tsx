import { Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PreviewBannerProps {
  dashboardType: 'Artist' | 'Label' | 'Agency';
}

export const PreviewBanner = ({ dashboardType }: PreviewBannerProps) => {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-accent/20 border-accent/30">
      <Eye className="h-4 w-4 text-accent-foreground" />
      <AlertDescription className="text-sm text-accent-foreground ml-2">
        <strong>Admin Preview Mode:</strong> Viewing {dashboardType} Dashboard
      </AlertDescription>
    </Alert>
  );
};
