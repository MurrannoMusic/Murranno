import { useNetwork } from '@/hooks/useNetwork';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const NetworkStatus = () => {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <Alert variant="destructive" className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        No internet connection. Some features may not work.
      </AlertDescription>
    </Alert>
  );
};
