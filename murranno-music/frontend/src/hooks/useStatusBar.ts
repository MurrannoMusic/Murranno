import { useEffect, useCallback } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { isNativeApp } from '@/utils/platformDetection';

export const useStatusBar = () => {
  const setStyle = useCallback(async (style: 'light' | 'dark') => {
    if (!isNativeApp()) return;

    try {
      await StatusBar.setStyle({ 
        style: style === 'light' ? Style.Light : Style.Dark 
      });
    } catch (error) {
      console.error('Failed to set status bar style:', error);
    }
  }, []);

  const setBackgroundColor = useCallback(async (color: string) => {
    if (!isNativeApp()) return;

    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Failed to set status bar background:', error);
    }
  }, []);

  const hide = useCallback(async () => {
    if (!isNativeApp()) return;

    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Failed to hide status bar:', error);
    }
  }, []);

  const show = useCallback(async () => {
    if (!isNativeApp()) return;

    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Failed to show status bar:', error);
    }
  }, []);

  const setOverlaysWebView = useCallback(async (overlay: boolean) => {
    if (!isNativeApp()) return;

    try {
      await StatusBar.setOverlaysWebView({ overlay });
    } catch (error) {
      console.error('Failed to set status bar overlay:', error);
    }
  }, []);

  return {
    setStyle,
    setBackgroundColor,
    hide,
    show,
    setOverlaysWebView,
  };
};

// Hook to automatically set status bar based on theme
export const useAutoStatusBar = (theme: 'light' | 'dark') => {
  const { setStyle } = useStatusBar();

  useEffect(() => {
    if (isNativeApp()) {
      setStyle(theme);
    }
  }, [theme, setStyle]);
};
