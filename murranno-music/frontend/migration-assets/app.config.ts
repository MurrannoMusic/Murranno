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
  
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },
  
  assetBundlePatterns: ['**/*'],
  
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.murranno.music',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription: 'Allow camera access for profile photos and cover art',
      NSPhotoLibraryUsageDescription: 'Allow photo library access for uploading images',
      NSMicrophoneUsageDescription: 'Allow microphone access for audio recording',
      NSFaceIDUsageDescription: 'Use Face ID for secure authentication',
      NSLocationWhenInUseUsageDescription: 'Allow location access for personalized content',
      UIBackgroundModes: ['audio', 'fetch', 'remote-notification'],
    },
    associatedDomains: [
      'applinks:nqfltvbzqxdxsobhedci.supabase.co',
    ],
    config: {
      usesNonExemptEncryption: false,
    },
  },
  
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    package: 'com.murranno.music',
    versionCode: 1,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.RECORD_AUDIO',
      'android.permission.USE_BIOMETRIC',
      'android.permission.USE_FINGERPRINT',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          { scheme: 'murranno' },
          {
            scheme: 'https',
            host: 'nqfltvbzqxdxsobhedci.supabase.co',
            pathPrefix: '/auth/v1/callback',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  
  plugins: [
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ffffff',
        sounds: ['./assets/sounds/notification.wav'],
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID for secure authentication.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow $(PRODUCT_NAME) to access your photos.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
      },
    ],
    'expo-router',
  ],
  
  extra: {
    eas: {
      projectId: 'your-eas-project-id',
    },
    supabaseUrl: 'https://nqfltvbzqxdxsobhedci.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZmx0dmJ6cXhkeHNvYmhlZGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzQ2MDUsImV4cCI6MjA3NTU1MDYwNX0.aEQ0gFX0hmC5yhpzCisd5l0GqJKHbFtqfVB0xpzCqcY',
  },
  
  owner: 'murranno',
  
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/your-eas-project-id',
  },
  
  runtimeVersion: {
    policy: 'appVersion',
  },
});
