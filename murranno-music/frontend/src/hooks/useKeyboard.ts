import { useEffect, useState } from 'react';
import { Keyboard, KeyboardInfo, KeyboardStyle, KeyboardResize } from '@capacitor/keyboard';
import { isNativeApp } from '@/utils/platformDetection';

export const useKeyboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!isNativeApp()) return;

    let showListener: any;
    let hideListener: any;

    const setupKeyboardListeners = async () => {
      // Listen for keyboard show
      showListener = await Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
        console.log('Keyboard will show:', info);
        setIsVisible(true);
        setKeyboardHeight(info.keyboardHeight);
      });

      // Listen for keyboard hide
      hideListener = await Keyboard.addListener('keyboardWillHide', () => {
        console.log('Keyboard will hide');
        setIsVisible(false);
        setKeyboardHeight(0);
      });
    };

    setupKeyboardListeners();

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  const show = async () => {
    if (!isNativeApp()) return;
    await Keyboard.show();
  };

  const hide = async () => {
    if (!isNativeApp()) return;
    await Keyboard.hide();
  };

  const setAccessoryBarVisible = async (visible: boolean) => {
    if (!isNativeApp()) return;
    await Keyboard.setAccessoryBarVisible({ isVisible: visible });
  };

  const setScroll = async (enabled: boolean) => {
    if (!isNativeApp()) return;
    await Keyboard.setScroll({ isDisabled: !enabled });
  };

  const setStyle = async (style: KeyboardStyle) => {
    if (!isNativeApp()) return;
    await Keyboard.setStyle({ style });
  };

  const setResizeMode = async (mode: KeyboardResize) => {
    if (!isNativeApp()) return;
    await Keyboard.setResizeMode({ mode });
  };

  return {
    isVisible,
    keyboardHeight,
    show,
    hide,
    setAccessoryBarVisible,
    setScroll,
    setStyle,
    setResizeMode,
  };
};
