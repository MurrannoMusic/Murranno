import { useEffect, useState } from 'react';
import { ScreenOrientation, OrientationLockType } from '@capacitor/screen-orientation';
import { isNativeApp } from '@/utils/platformDetection';

export const useScreenOrientation = () => {
  const [currentOrientation, setCurrentOrientation] = useState<string | null>(null);

  useEffect(() => {
    if (!isNativeApp()) return;

    let orientationListener: any;

    const setupOrientationListener = async () => {
      // Get initial orientation
      try {
        const orientation = await ScreenOrientation.orientation();
        setCurrentOrientation(orientation.type);
      } catch (error) {
        console.error('Failed to get initial orientation:', error);
      }

      // Listen for orientation changes
      orientationListener = await ScreenOrientation.addListener('screenOrientationChange', (orientation) => {
        console.log('Orientation changed:', orientation);
        setCurrentOrientation(orientation.type);
      });
    };

    setupOrientationListener();

    return () => {
      orientationListener?.remove();
    };
  }, []);

  const lock = async (orientation: OrientationLockType) => {
    if (!isNativeApp()) return;

    try {
      await ScreenOrientation.lock({ orientation });
    } catch (error) {
      console.error('Failed to lock orientation:', error);
    }
  };

  const unlock = async () => {
    if (!isNativeApp()) return;

    try {
      await ScreenOrientation.unlock();
    } catch (error) {
      console.error('Failed to unlock orientation:', error);
    }
  };

  const getCurrentOrientation = async () => {
    if (!isNativeApp()) return null;

    try {
      const orientation = await ScreenOrientation.orientation();
      return orientation.type;
    } catch (error) {
      console.error('Failed to get orientation:', error);
      return null;
    }
  };

  const isPortrait = currentOrientation === 'portrait-primary' || currentOrientation === 'portrait-secondary';
  const isLandscape = currentOrientation === 'landscape-primary' || currentOrientation === 'landscape-secondary';

  return {
    currentOrientation,
    isPortrait,
    isLandscape,
    lock,
    unlock,
    getCurrentOrientation,
  };
};
