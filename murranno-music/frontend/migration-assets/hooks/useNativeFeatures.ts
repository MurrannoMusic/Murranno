/**
 * React Native Native Features Hooks
 * 
 * Complete Expo equivalents of Capacitor native hooks
 * Phase 6: Native Features Integration
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import * as DocumentPicker from 'expo-document-picker';
import { Audio, AVPlaybackStatus } from 'expo-av';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Platform, AppState, AppStateStatus } from 'react-native';

// ============================================
// Types
// ============================================
export type ImpactStyle = 'light' | 'medium' | 'heavy';
export type NotificationType = 'success' | 'warning' | 'error';
export type BiometryType = 'faceId' | 'fingerprint' | 'iris' | null;
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'none' | 'unknown';

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  heading: number | null;
  speed: number | null;
}

export interface DeviceInfo {
  brand: string | null;
  modelName: string | null;
  osName: string | null;
  osVersion: string | null;
  isDevice: boolean;
  deviceType: 'phone' | 'tablet' | 'desktop' | 'tv' | 'unknown';
  deviceYearClass: number | null;
}

// ============================================
// useHaptics - Vibration feedback
// ============================================
export function useHaptics() {
  const impact = useCallback(async (style: ImpactStyle = 'medium') => {
    const impactStyles = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    await Haptics.impactAsync(impactStyles[style]);
  }, []);

  const notification = useCallback(async (type: NotificationType = 'success') => {
    const notificationTypes = {
      success: Haptics.NotificationFeedbackType.Success,
      warning: Haptics.NotificationFeedbackType.Warning,
      error: Haptics.NotificationFeedbackType.Error,
    };
    await Haptics.notificationAsync(notificationTypes[type]);
  }, []);

  const selection = useCallback(async () => {
    await Haptics.selectionAsync();
  }, []);

  return { impact, notification, selection };
}

// ============================================
// useBiometricAuth - Face ID / Fingerprint
// ============================================
export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsAvailable(compatible && enrolled);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometryType('faceId');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometryType('fingerprint');
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometryType('iris');
        }
      }
    } catch (error) {
      console.error('Biometric check failed:', error);
      setIsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = useCallback(async (promptMessage = 'Authenticate to continue') => {
    if (!isAvailable) return { success: false, error: 'Biometrics not available' };

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use passcode',
      });

      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }, [isAvailable]);

  return { isAvailable, biometryType, isLoading, authenticate, checkAvailability };
}

// ============================================
// useCamera - Photo capture & gallery
// ============================================
export function useCamera() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const takePhoto = useCallback(async (): Promise<ImageResult | null> => {
    try {
      setIsCapturing(true);
      const granted = await requestPermission();
      if (!granted) return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled || !result.assets[0]) return null;
      
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileName: asset.fileName || 'photo.jpg',
        fileSize: asset.fileSize,
      };
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const pickImage = useCallback(async (): Promise<ImageResult | null> => {
    try {
      setIsCapturing(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled || !result.assets[0]) return null;
      
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileName: asset.fileName || 'photo.jpg',
        fileSize: asset.fileSize,
      };
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return { hasPermission, isCapturing, takePhoto, pickImage };
}

// ============================================
// usePushNotifications
// ============================================
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // Replace with your Expo project ID
    });

    setExpoPushToken(token.data);

    // Configure for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
      });
    }

    return token.data;
  }, []);

  const scheduleLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: Record<string, unknown>,
    trigger?: Notifications.NotificationTriggerInput
  ) => {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: trigger || null,
    });
  }, []);

  const setBadgeCount = useCallback(async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  }, []);

  const clearAllNotifications = useCallback(async () => {
    await Notifications.dismissAllNotificationsAsync();
  }, []);

  return {
    expoPushToken,
    notification,
    registerForPushNotifications,
    scheduleLocalNotification,
    setBadgeCount,
    clearAllNotifications,
  };
}

// ============================================
// useClipboard
// ============================================
export function useClipboard() {
  const copy = useCallback(async (text: string) => {
    await Clipboard.setStringAsync(text);
    return true;
  }, []);

  const paste = useCallback(async () => {
    return await Clipboard.getStringAsync();
  }, []);

  const hasContent = useCallback(async () => {
    return await Clipboard.hasStringAsync();
  }, []);

  return { copy, paste, hasContent };
}

// ============================================
// useShare
// ============================================
export function useShare() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    Sharing.isAvailableAsync().then(setIsAvailable);
  }, []);

  const share = useCallback(async (options: { title?: string; message?: string; url?: string }) => {
    if (!isAvailable) {
      console.log('Sharing is not available');
      return false;
    }

    try {
      if (options.url) {
        await Sharing.shareAsync(options.url, {
          dialogTitle: options.title,
        });
      }
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }, [isAvailable]);

  return { isAvailable, share };
}

// ============================================
// useBrowser
// ============================================
export function useBrowser() {
  const open = useCallback(async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#FF6B35',
        toolbarColor: '#0A0A0F',
      });
      return true;
    } catch (error) {
      console.error('Browser open failed:', error);
      return false;
    }
  }, []);

  const openAuth = useCallback(async (url: string, redirectUrl: string) => {
    try {
      return await WebBrowser.openAuthSessionAsync(url, redirectUrl);
    } catch (error) {
      console.error('Auth browser failed:', error);
      return null;
    }
  }, []);

  const dismiss = useCallback(async () => {
    await WebBrowser.dismissBrowser();
  }, []);

  return { open, openAuth, dismiss };
}

// ============================================
// useNetwork
// ============================================
export function useNetwork() {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<ConnectionType>('unknown');
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable);
      
      switch (state.type) {
        case 'wifi':
          setConnectionType('wifi');
          break;
        case 'cellular':
          setConnectionType('cellular');
          break;
        case 'ethernet':
          setConnectionType('ethernet');
          break;
        case 'bluetooth':
          setConnectionType('bluetooth');
          break;
        case 'none':
          setConnectionType('none');
          break;
        default:
          setConnectionType('unknown');
      }
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, connectionType, isInternetReachable };
}

// ============================================
// useGeolocation
// ============================================
export function useGeolocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentPosition = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords: LocationCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        altitude: currentLocation.coords.altitude,
        accuracy: currentLocation.coords.accuracy,
        heading: currentLocation.coords.heading,
        speed: currentLocation.coords.speed,
      };

      setLocation(coords);
      return coords;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get location';
      setErrorMsg(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const watchPosition = useCallback(async (callback: (coords: LocationCoords) => void) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return null;
    }

    const subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10 },
      (position) => {
        const coords: LocationCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        };
        setLocation(coords);
        callback(coords);
      }
    );

    return () => subscription.remove();
  }, []);

  return { location, errorMsg, isLoading, getCurrentPosition, watchPosition };
}

// ============================================
// useDevice
// ============================================
export function useDevice(): DeviceInfo {
  const getDeviceType = (): DeviceInfo['deviceType'] => {
    switch (Device.deviceType) {
      case Device.DeviceType.PHONE:
        return 'phone';
      case Device.DeviceType.TABLET:
        return 'tablet';
      case Device.DeviceType.DESKTOP:
        return 'desktop';
      case Device.DeviceType.TV:
        return 'tv';
      default:
        return 'unknown';
    }
  };

  return {
    brand: Device.brand,
    modelName: Device.modelName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    isDevice: Device.isDevice,
    deviceType: getDeviceType(),
    deviceYearClass: Device.deviceYearClass,
  };
}

// ============================================
// useSecureStorage - Encrypted storage
// ============================================
export function useSecureStorage() {
  const setItem = useCallback(async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error('SecureStore set failed:', error);
      return false;
    }
  }, []);

  const getItem = useCallback(async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore get failed:', error);
      return null;
    }
  }, []);

  const deleteItem = useCallback(async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('SecureStore delete failed:', error);
      return false;
    }
  }, []);

  return { setItem, getItem, deleteItem };
}

// ============================================
// useFileSystem - File operations
// ============================================
export function useFileSystem() {
  const cacheDirectory = FileSystem.cacheDirectory;
  const documentDirectory = FileSystem.documentDirectory;

  const writeFile = useCallback(async (
    filename: string,
    content: string,
    directory: 'cache' | 'documents' = 'documents'
  ) => {
    try {
      const baseDir = directory === 'cache' ? cacheDirectory : documentDirectory;
      const uri = `${baseDir}${filename}`;
      await FileSystem.writeAsStringAsync(uri, content);
      return uri;
    } catch (error) {
      console.error('Write file failed:', error);
      return null;
    }
  }, [cacheDirectory, documentDirectory]);

  const readFile = useCallback(async (uri: string) => {
    try {
      return await FileSystem.readAsStringAsync(uri);
    } catch (error) {
      console.error('Read file failed:', error);
      return null;
    }
  }, []);

  const deleteFile = useCallback(async (uri: string) => {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      return true;
    } catch (error) {
      console.error('Delete file failed:', error);
      return false;
    }
  }, []);

  const downloadFile = useCallback(async (url: string, filename: string) => {
    try {
      const uri = `${cacheDirectory}${filename}`;
      const result = await FileSystem.downloadAsync(url, uri);
      return result.uri;
    } catch (error) {
      console.error('Download file failed:', error);
      return null;
    }
  }, [cacheDirectory]);

  const getFileInfo = useCallback(async (uri: string) => {
    try {
      return await FileSystem.getInfoAsync(uri);
    } catch (error) {
      console.error('Get file info failed:', error);
      return null;
    }
  }, []);

  const cacheAudioFile = useCallback(async (url: string, filename: string) => {
    try {
      const audioDir = `${cacheDirectory}audio/`;
      const cachedUri = `${audioDir}${filename}`;
      
      // Check if already cached
      const info = await FileSystem.getInfoAsync(cachedUri);
      if (info.exists) return cachedUri;

      // Ensure directory exists
      await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
      
      // Download and cache
      const result = await FileSystem.downloadAsync(url, cachedUri);
      return result.uri;
    } catch (error) {
      console.error('Cache audio failed:', error);
      return url; // Fallback to original URL
    }
  }, [cacheDirectory]);

  const clearCache = useCallback(async () => {
    try {
      if (cacheDirectory) {
        const files = await FileSystem.readDirectoryAsync(cacheDirectory);
        await Promise.all(
          files.map(file => FileSystem.deleteAsync(`${cacheDirectory}${file}`, { idempotent: true }))
        );
      }
      return true;
    } catch (error) {
      console.error('Clear cache failed:', error);
      return false;
    }
  }, [cacheDirectory]);

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) return null;
      return result.assets[0];
    } catch (error) {
      console.error('Pick document failed:', error);
      return null;
    }
  }, []);

  return {
    cacheDirectory,
    documentDirectory,
    writeFile,
    readFile,
    deleteFile,
    downloadFile,
    getFileInfo,
    cacheAudioFile,
    clearCache,
    pickDocument,
  };
}

// ============================================
// useAudio - Audio playback
// ============================================
export function useAudio() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => {
      // Cleanup sound on unmount
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
    }
  }, []);

  const loadAudio = useCallback(async (uri: string) => {
    try {
      setIsLoading(true);
      
      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      return true;
    } catch (error) {
      console.error('Load audio failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sound, onPlaybackStatusUpdate]);

  const play = useCallback(async () => {
    if (!sound) return false;
    try {
      await sound.playAsync();
      return true;
    } catch (error) {
      console.error('Play failed:', error);
      return false;
    }
  }, [sound]);

  const pause = useCallback(async () => {
    if (!sound) return false;
    try {
      await sound.pauseAsync();
      return true;
    } catch (error) {
      console.error('Pause failed:', error);
      return false;
    }
  }, [sound]);

  const stop = useCallback(async () => {
    if (!sound) return false;
    try {
      await sound.stopAsync();
      return true;
    } catch (error) {
      console.error('Stop failed:', error);
      return false;
    }
  }, [sound]);

  const seekTo = useCallback(async (positionMillis: number) => {
    if (!sound) return false;
    try {
      await sound.setPositionAsync(positionMillis);
      return true;
    } catch (error) {
      console.error('Seek failed:', error);
      return false;
    }
  }, [sound]);

  const setVolume = useCallback(async (volume: number) => {
    if (!sound) return false;
    try {
      await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      return true;
    } catch (error) {
      console.error('Set volume failed:', error);
      return false;
    }
  }, [sound]);

  return {
    isPlaying,
    isLoading,
    position,
    duration,
    loadAudio,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
  };
}

// ============================================
// useAppState - App lifecycle
// ============================================
export function useAppState() {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
  };
}

// ============================================
// useNativeFeatures - Combined hook
// ============================================
export function useNativeFeatures() {
  const haptics = useHaptics();
  const biometrics = useBiometricAuth();
  const camera = useCamera();
  const pushNotifications = usePushNotifications();
  const clipboard = useClipboard();
  const share = useShare();
  const browser = useBrowser();
  const network = useNetwork();
  const geolocation = useGeolocation();
  const device = useDevice();
  const secureStorage = useSecureStorage();
  const fileSystem = useFileSystem();
  const audio = useAudio();
  const appState = useAppState();

  return {
    haptics,
    biometrics,
    camera,
    pushNotifications,
    clipboard,
    share,
    browser,
    network,
    geolocation,
    device,
    secureStorage,
    fileSystem,
    audio,
    appState,
  };
}

export default useNativeFeatures;
