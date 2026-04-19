import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

export const PushNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, isRegistered } = usePushNotifications();

  useEffect(() => {
    const registerToken = async () => {
      if (token && isRegistered) {
        console.log('Push notifications registered with token:', token);
        
        try {
          const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
          
          const { error } = await supabase.functions.invoke('register-push-token', {
            body: {
              token,
              platform,
              deviceInfo: {
                platform: Capacitor.getPlatform(),
                isNative: Capacitor.isNativePlatform(),
              },
            },
          });

          if (error) {
            console.error('Failed to register push token:', error);
          } else {
            console.log('Push token registered successfully');
          }
        } catch (error) {
          console.error('Error registering push token:', error);
        }
      }
    };

    registerToken();
  }, [token, isRegistered]);

  return <>{children}</>;
};
