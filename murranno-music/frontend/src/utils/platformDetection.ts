import { Capacitor } from '@capacitor/core';

const DEVICE_PREFERENCE_KEY = 'murranno-device-preference';

export const isNativeApp = () => Capacitor.isNativePlatform();

export const isDevelopment = () => import.meta.env.DEV;

export const isMobileScreen = () => window.innerWidth < 1024;

// Get detailed platform information
export const getPlatformInfo = () => {
  const platform = Capacitor.getPlatform();
  return {
    platform,
    isNative: Capacitor.isNativePlatform(),
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    userAgent: navigator.userAgent,
  };
};

// Get stored device preference from localStorage
export const getStoredDevicePreference = (): 'mobile' | 'desktop' | null => {
  try {
    const stored = localStorage.getItem(DEVICE_PREFERENCE_KEY);
    return stored === 'mobile' || stored === 'desktop' ? stored : null;
  } catch {
    return null;
  }
};

// Set device preference in localStorage
export const setStoredDevicePreference = (preference: 'mobile' | 'desktop' | null) => {
  try {
    if (preference === null) {
      localStorage.removeItem(DEVICE_PREFERENCE_KEY);
    } else {
      localStorage.setItem(DEVICE_PREFERENCE_KEY, preference);
    }
  } catch {
    // Ignore localStorage errors
  }
};

// Check if should show mobile routes (respects stored preference)
export const shouldShowMobileRoutes = () => {
  const stored = getStoredDevicePreference();
  if (stored === 'mobile') return true;
  if (stored === 'desktop') return false;
  return isNativeApp() || isDevelopment() || isMobileScreen();
};

// Get effective mobile state (respects stored preference)
export const getEffectiveMobileState = (): boolean => {
  const stored = getStoredDevicePreference();
  if (stored === 'mobile') return true;
  if (stored === 'desktop') return false;
  
  if (isNativeApp()) return true;
  return isMobileScreen();
};
