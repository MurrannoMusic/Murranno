import { useEffect, useState } from 'react';
import { App, AppState } from '@capacitor/app';
import { isNativeApp } from '@/utils/platformDetection';

export const useAppLifecycle = () => {
  const [isActive, setIsActive] = useState(true);
  const [appState, setAppState] = useState<AppState | null>(null);

  useEffect(() => {
    if (!isNativeApp()) return;

    let stateChangeListener: any;

    const setupListeners = async () => {
      // Listen for app state changes
      stateChangeListener = await App.addListener('appStateChange', (state) => {
        console.log('App state changed:', state);
        setAppState(state);
        setIsActive(state.isActive);
      });

      // Listen for back button (Android)
      await App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
    };

    setupListeners();

    return () => {
      stateChangeListener?.remove();
    };
  }, []);

  const exitApp = async () => {
    if (!isNativeApp()) return;
    await App.exitApp();
  };

  const minimizeApp = async () => {
    if (!isNativeApp()) return;
    await App.minimizeApp();
  };

  const getInfo = async () => {
    if (!isNativeApp()) return null;
    return await App.getInfo();
  };

  return {
    isActive,
    appState,
    exitApp,
    minimizeApp,
    getInfo,
  };
};
