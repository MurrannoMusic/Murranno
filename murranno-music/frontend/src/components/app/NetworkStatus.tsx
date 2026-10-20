import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useNetwork } from '@/hooks/useNetwork';
import { dismissSessionExpired, setOnline, useAppStatus } from '@/lib/appStatus';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const SIGNED_OUT_PATHS = /^\/(login|signup|welcome|forgot-password|reset-password|verify-email|auth)(\/|$)/;

/** Global connection + session states: offline banner, slow-connection banner, session-expired dialog. Render inside the router. */
export const NetworkStatus = () => {
  const { online, slow, sessionExpired } = useAppStatus();
  const native = useNetwork(); // Capacitor network events on the native app
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const wasOffline = useRef(false);

  useEffect(() => { setOnline(native.isOnline); }, [native.isOnline]);
  useEffect(() => {
    if (!online) { wasOffline.current = true; return; }
    if (wasOffline.current) {
      wasOffline.current = false;
      toast.success('Back online');
      void queryClient.invalidateQueries(); // reload whatever failed while offline
    }
  }, [online, queryClient]);

  const signInAgain = () => {
    dismissSessionExpired();
    navigate(`/login?reason=expired&next=${encodeURIComponent(pathname + search)}`);
  };

  return <>
    {!online ? (
      <div role="alert" className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-destructive px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] text-sm font-medium text-destructive-foreground">
        <WifiOff className="h-4 w-4" /> You’re offline. Changes won’t be saved until you reconnect.
      </div>
    ) : slow ? (
      <div role="status" className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-warning/95 px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-sm font-medium text-warning-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Slow connection — still working on it…
      </div>
    ) : null}

    <AlertDialog open={sessionExpired && !SIGNED_OUT_PATHS.test(pathname)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Your session has expired</AlertDialogTitle>
          <AlertDialogDescription>For your security you’ve been signed out. Sign in again to pick up right where you left off — nothing you saved has been lost.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { dismissSessionExpired(); navigate('/'); }}>Not now</AlertDialogCancel>
          <AlertDialogAction onClick={signInAgain}>Sign in again</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
};
