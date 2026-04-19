import { useEffect, useState } from 'react';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

// Note: @capacitor/push-notifications package is not installed
// Push notifications are disabled for now
export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) {
      return;
    }

    // Push notifications disabled - package not installed
    console.warn('Push notifications are disabled: @capacitor/push-notifications not installed');
  }, []);

  const getDeliveredNotifications = async () => {
    if (!isNativeApp()) {
      return [];
    }

    // Disabled
    return [];
  };

  const removeAllDeliveredNotifications = async () => {
    if (!isNativeApp()) {
      return;
    }

    // Disabled
    toast.info('Push notifications are disabled');
  };

  return {
    token,
    isRegistered,
    getDeliveredNotifications,
    removeAllDeliveredNotifications,
  };
};
