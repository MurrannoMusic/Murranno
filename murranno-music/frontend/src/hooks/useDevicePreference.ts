import { useState, useCallback, useEffect } from 'react';
import { getStoredDevicePreference, setStoredDevicePreference } from '@/utils/platformDetection';

export type DevicePreference = 'mobile' | 'desktop' | 'auto';

export const useDevicePreference = () => {
  const [preference, setPreference] = useState<DevicePreference>(() => {
    const stored = getStoredDevicePreference();
    return stored || 'auto';
  });

  const updatePreference = useCallback((newPreference: DevicePreference) => {
    setPreference(newPreference);
    setStoredDevicePreference(newPreference === 'auto' ? null : newPreference);
    
    // Force reload to apply new preference
    window.location.reload();
  }, []);

  useEffect(() => {
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'murranno-device-preference') {
        const stored = getStoredDevicePreference();
        setPreference(stored || 'auto');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    preference,
    setPreference: updatePreference,
    isAuto: preference === 'auto',
  };
};
