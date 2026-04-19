import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Murranno Music',
  slug: 'murranno-music',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'murranno',
  
  // Splash screen configuration
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1A1F2E',
  },
  
  // iOS configuration
  ios: {
    bundleIdentifier: 'com.murranno.music',
    supportsTablet: true,
    // Universal Links configuration
    associatedDomains: [
      'applinks:murranno.com',
      'applinks:www.murranno.com',
      'webcredentials:murranno.com',
    ],
    infoPlist: {
      NSCameraUsageDescription: 'Used to take photos for cover art',
      NSPhotoLibraryUsageDescription: 'Used to select photos for cover art',
      NSMicrophoneUsageDescription: 'Used for audio recording',
      UIBackgroundModes: ['audio', 'remote-notification'],
    },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#1A1F2E',
      dark: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#0F1318',
      },
    },
  },
  
  // Android configuration
  android: {
    package: 'com.murranno.music',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1A1F2E',
    },
    // App Links configuration
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'murranno.com',
            pathPrefix: '/',
          },
          {
            scheme: 'https',
            host: 'www.murranno.com',
            pathPrefix: '/',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.RECORD_AUDIO',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
    ],
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#1A1F2E',
      dark: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#0F1318',
      },
    },
  },
  
  // Web configuration (optional)
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },
  
  // Plugins
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#1A1F2E',
        image: './assets/splash.png',
        dark: {
          image: './assets/splash.png',
          backgroundColor: '#0F1318',
        },
        imageWidth: 200,
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#6366F1',
        sounds: ['./assets/sounds/notification.wav'],
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Murranno Music to access your camera for cover art photos.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Murranno Music to access your photos for cover art.',
      },
    ],
    [
      'expo-av',
      {
        microphonePermission: 'Allow Murranno Music to access your microphone for audio recording.',
      },
    ],
    'expo-localization',
    'expo-secure-store',
  ],
  
  // Extra configuration
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: 'your-eas-project-id',
    },
  },
  
  // EAS Updates
  updates: {
    url: 'https://u.expo.dev/your-project-id',
    fallbackToCacheTimeout: 0,
  },
  
  // Runtime version for OTA updates
  runtimeVersion: {
    policy: 'appVersion',
  },
  
  // Owner
  owner: 'murranno',
});
