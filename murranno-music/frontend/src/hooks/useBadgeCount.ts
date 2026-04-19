import { useEffect } from 'react';
import { Badge } from '@capawesome/capacitor-badge';
import { isNativeApp } from '@/utils/platformDetection';

export const useBadgeCount = (count: number) => {
  useEffect(() => {
    const updateBadge = async () => {
      if (!isNativeApp()) {
        return;
      }

      try {
        // Check if badge is supported
        const { isSupported } = await Badge.isSupported();
        
        if (!isSupported) {
          console.log('Badge not supported on this platform');
          return;
        }

        // Request permission if needed (mainly for iOS)
        const { display } = await Badge.checkPermissions();
        
        if (display === 'prompt') {
          const result = await Badge.requestPermissions();
          if (result.display !== 'granted') {
            console.log('Badge permission denied');
            return;
          }
        }

        // Set the badge count
        if (count > 0) {
          await Badge.set({ count });
          console.log(`Badge count set to ${count}`);
        } else {
          // Clear badge when count is 0
          await Badge.clear();
          console.log('Badge cleared');
        }
      } catch (error) {
        console.error('Error updating badge:', error);
      }
    };

    updateBadge();
  }, [count]);

  const clearBadge = async () => {
    if (!isNativeApp()) {
      return;
    }

    try {
      await Badge.clear();
      console.log('Badge cleared manually');
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  };

  return { clearBadge };
};
