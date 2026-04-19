import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isNativeApp } from '@/utils/platformDetection';

export const useHaptics = () => {
  const impact = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isNativeApp()) return;

    try {
      const impactStyle = 
        style === 'light' ? ImpactStyle.Light :
        style === 'heavy' ? ImpactStyle.Heavy :
        ImpactStyle.Medium;

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Haptic impact failed:', error);
    }
  };

  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!isNativeApp()) return;

    try {
      const notificationType = 
        type === 'success' ? NotificationType.Success :
        type === 'warning' ? NotificationType.Warning :
        NotificationType.Error;

      await Haptics.notification({ type: notificationType });
    } catch (error) {
      console.error('Haptic notification failed:', error);
    }
  };

  const vibrate = async (duration: number = 300) => {
    if (!isNativeApp()) return;

    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('Haptic vibrate failed:', error);
    }
  };

  const selectionStart = async () => {
    if (!isNativeApp()) return;

    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.error('Haptic selection start failed:', error);
    }
  };

  const selectionChanged = async () => {
    if (!isNativeApp()) return;

    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.error('Haptic selection changed failed:', error);
    }
  };

  const selectionEnd = async () => {
    if (!isNativeApp()) return;

    try {
      await Haptics.selectionEnd();
    } catch (error) {
      console.error('Haptic selection end failed:', error);
    }
  };

  // Common haptic patterns for UI interactions
  const buttonPress = () => impact('light');
  const success = () => notification('success');
  const error = () => notification('error');
  const warning = () => notification('warning');
  const toggle = () => impact('medium');
  const swipe = () => impact('light');

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
    buttonPress,
    success,
    error,
    warning,
    toggle,
    swipe,
  };
};
