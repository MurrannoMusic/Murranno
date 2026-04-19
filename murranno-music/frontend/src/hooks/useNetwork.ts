import { useEffect, useState } from 'react';
import { Network, ConnectionStatus } from '@capacitor/network';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

export const useNetwork = () => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    if (!isNativeApp()) {
      // Fallback to web API
      const updateOnlineStatus = () => {
        setIsOnline(navigator.onLine);
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      updateOnlineStatus();

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }

    let networkListener: any;

    const setupNetworkListener = async () => {
      // Get initial status
      const initialStatus = await Network.getStatus();
      setStatus(initialStatus);
      setIsOnline(initialStatus.connected);
      setConnectionType(initialStatus.connectionType);

      // Listen for network changes
      networkListener = await Network.addListener('networkStatusChange', (status) => {
        console.log('Network status changed:', status);
        setStatus(status);
        setIsOnline(status.connected);
        setConnectionType(status.connectionType);

        // Show toast on connection change
        if (status.connected) {
          toast.success('Back online');
        } else {
          toast.error('No internet connection');
        }
      });
    };

    setupNetworkListener();

    return () => {
      networkListener?.remove();
    };
  }, []);

  const checkStatus = async () => {
    if (!isNativeApp()) {
      return { connected: navigator.onLine, connectionType: 'unknown' };
    }
    return await Network.getStatus();
  };

  return {
    isOnline,
    connectionType,
    status,
    checkStatus,
  };
};
