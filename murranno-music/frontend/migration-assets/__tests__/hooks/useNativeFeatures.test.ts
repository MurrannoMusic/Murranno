import { renderHook, act } from '@testing-library/react-native';
import { useHaptics, useBiometricAuth, useCamera, useClipboard, useShare, useNetwork } from '../../hooks/useNativeFeatures';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoClipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import NetInfo from '@react-native-community/netinfo';

// Mock all native modules
jest.mock('expo-haptics');
jest.mock('expo-local-authentication');
jest.mock('expo-image-picker');
jest.mock('expo-clipboard');
jest.mock('expo-sharing');
jest.mock('@react-native-community/netinfo');

describe('useHaptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger light impact', async () => {
    const { result } = renderHook(() => useHaptics());
    
    await act(async () => {
      await result.current.light();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    );
  });

  it('should trigger medium impact', async () => {
    const { result } = renderHook(() => useHaptics());
    
    await act(async () => {
      await result.current.medium();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium
    );
  });

  it('should trigger heavy impact', async () => {
    const { result } = renderHook(() => useHaptics());
    
    await act(async () => {
      await result.current.heavy();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Heavy
    );
  });

  it('should trigger success notification', async () => {
    const { result } = renderHook(() => useHaptics());
    
    await act(async () => {
      await result.current.success();
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });

  it('should trigger error notification', async () => {
    const { result } = renderHook(() => useHaptics());
    
    await act(async () => {
      await result.current.error();
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Error
    );
  });
});

describe('useBiometricAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check biometric availability', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
      LocalAuthentication.AuthenticationType.FINGERPRINT,
    ]);

    const { result } = renderHook(() => useBiometricAuth());
    
    await act(async () => {
      const available = await result.current.checkAvailability();
      expect(available).toBe(true);
    });
  });

  it('should return false when no hardware', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useBiometricAuth());
    
    await act(async () => {
      const available = await result.current.checkAvailability();
      expect(available).toBe(false);
    });
  });

  it('should authenticate successfully', async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useBiometricAuth());
    
    await act(async () => {
      const authenticated = await result.current.authenticate('Confirm your identity');
      expect(authenticated).toBe(true);
    });
  });

  it('should handle authentication failure', async () => {
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
      success: false,
      error: 'user_cancel',
    });

    const { result } = renderHook(() => useBiometricAuth());
    
    await act(async () => {
      const authenticated = await result.current.authenticate();
      expect(authenticated).toBe(false);
    });
  });
});

describe('useCamera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should request camera permissions', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    const { result } = renderHook(() => useCamera());
    
    await act(async () => {
      const granted = await result.current.requestPermission();
      expect(granted).toBe(true);
    });
  });

  it('should take a photo', async () => {
    const mockImage = { uri: 'file://photo.jpg', width: 1920, height: 1080 };
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [mockImage],
    });

    const { result } = renderHook(() => useCamera());
    
    await act(async () => {
      const photo = await result.current.takePhoto();
      expect(photo).toEqual(mockImage);
    });
  });

  it('should pick image from library', async () => {
    const mockImage = { uri: 'file://library.jpg', width: 1920, height: 1080 };
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [mockImage],
    });

    const { result } = renderHook(() => useCamera());
    
    await act(async () => {
      const image = await result.current.pickImage();
      expect(image).toEqual(mockImage);
    });
  });

  it('should return null when cancelled', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const { result } = renderHook(() => useCamera());
    
    await act(async () => {
      const photo = await result.current.takePhoto();
      expect(photo).toBeNull();
    });
  });
});

describe('useClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should copy text to clipboard', async () => {
    (ExpoClipboard.setStringAsync as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useClipboard());
    
    await act(async () => {
      await result.current.copy('Hello, World!');
    });

    expect(ExpoClipboard.setStringAsync).toHaveBeenCalledWith('Hello, World!');
  });

  it('should paste text from clipboard', async () => {
    (ExpoClipboard.getStringAsync as jest.Mock).mockResolvedValue('Pasted text');

    const { result } = renderHook(() => useClipboard());
    
    let pastedText: string | undefined;
    await act(async () => {
      pastedText = await result.current.paste();
    });

    expect(pastedText).toBe('Pasted text');
  });

  it('should check if clipboard has content', async () => {
    (ExpoClipboard.hasStringAsync as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useClipboard());
    
    let hasContent: boolean | undefined;
    await act(async () => {
      hasContent = await result.current.hasContent();
    });

    expect(hasContent).toBe(true);
  });
});

describe('useShare', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should check if sharing is available', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useShare());
    
    let available: boolean | undefined;
    await act(async () => {
      available = await result.current.isAvailable();
    });

    expect(available).toBe(true);
  });

  it('should share a file', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useShare());
    
    await act(async () => {
      await result.current.shareFile('file://document.pdf');
    });

    expect(Sharing.shareAsync).toHaveBeenCalledWith('file://document.pdf', undefined);
  });
});

describe('useNetwork', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return network state', () => {
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      callback({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      });
      return jest.fn();
    });

    const { result } = renderHook(() => useNetwork());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isInternetReachable).toBe(true);
    expect(result.current.type).toBe('wifi');
  });

  it('should handle offline state', () => {
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      callback({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });
      return jest.fn();
    });

    const { result } = renderHook(() => useNetwork());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isInternetReachable).toBe(false);
  });
});
