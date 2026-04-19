/**
 * Hooks Index
 * Export all custom hooks for the React Native app
 */

// Native Features
export {
  useHaptics,
  useBiometricAuth,
  useCamera,
  usePushNotifications,
  useClipboard,
  useShare,
  useBrowser,
  useNetwork,
  useGeolocation,
  useDevice,
  useSecureStorage,
  useFileSystem,
  useAudio,
  useAppState,
  useNativeFeatures,
} from './useNativeFeatures';

export type {
  ImpactStyle,
  NotificationType,
  BiometryType,
  ImageResult,
  ShareOptions,
  ConnectionType,
  LocationCoords,
  DeviceInfo,
} from './useNativeFeatures';

// Authentication
export { useAuth } from './useAuth';
export type { AuthState, AuthActions } from './useAuth';

// Navigation
export { useAppNavigation } from './useAppNavigation';

// Toast Notifications
export { useToast, toast, setGlobalToast } from './useToast';
export type { Toast, ToastType, ToastOptions } from './useToast';

// Supabase Data Hooks
export { useSupabaseAuth } from './useSupabaseAuth';
export { useUserRole } from './useUserRole';
export { useReleases } from './useReleases';
export { useWallet } from './useWallet';
export { useCampaigns } from './useCampaigns';
export { useEarnings } from './useEarnings';
export { useNotifications } from './useNotifications';
