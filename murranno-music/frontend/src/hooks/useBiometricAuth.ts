import { BiometricAuth, BiometryType, BiometryError, BiometryErrorType } from '@aparajita/capacitor-biometric-auth';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

export const useBiometricAuth = () => {
  const checkAvailability = async (): Promise<{
    isAvailable: boolean;
    biometryType: BiometryType;
    reason?: string;
  }> => {
    if (!isNativeApp()) {
      return {
        isAvailable: false,
        biometryType: BiometryType.none,
        reason: 'Biometric auth is only available in native app',
      };
    }

    try {
      const result = await BiometricAuth.checkBiometry();
      return {
        isAvailable: result.isAvailable,
        biometryType: result.biometryType,
        reason: result.reason,
      };
    } catch (error) {
      console.error('Failed to check biometry:', error);
      return {
        isAvailable: false,
        biometryType: BiometryType.none,
        reason: 'Error checking biometric availability',
      };
    }
  };

  const authenticate = async (options?: {
    reason?: string;
    cancelTitle?: string;
    allowDeviceCredential?: boolean;
    iosFallbackTitle?: string;
    androidTitle?: string;
    androidSubtitle?: string;
    androidConfirmationRequired?: boolean;
  }): Promise<boolean> => {
    if (!isNativeApp()) {
      toast.error('Biometric authentication is only available in the native app');
      return false;
    }

    try {
      await BiometricAuth.authenticate({
        reason: options?.reason || 'Authenticate to continue',
        cancelTitle: options?.cancelTitle || 'Cancel',
        allowDeviceCredential: options?.allowDeviceCredential ?? false,
        iosFallbackTitle: options?.iosFallbackTitle,
        androidTitle: options?.androidTitle || 'Biometric Authentication',
        androidSubtitle: options?.androidSubtitle,
        androidConfirmationRequired: options?.androidConfirmationRequired ?? true,
      });
      
      return true;
    } catch (error) {
      const biometryError = error as BiometryError;
      
      // Handle different error types
      switch (biometryError.code) {
        case BiometryErrorType.userCancel:
          toast.error('Authentication cancelled');
          break;
        case BiometryErrorType.biometryNotAvailable:
          toast.error('Biometric authentication not available');
          break;
        case BiometryErrorType.biometryNotEnrolled:
          toast.error('No biometric credentials enrolled');
          break;
        case BiometryErrorType.biometryLockout:
          toast.error('Too many failed attempts. Try again later.');
          break;
        case BiometryErrorType.authenticationFailed:
          toast.error('Authentication failed');
          break;
        default:
          toast.error('Biometric authentication error');
      }
      
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  const getBiometryName = (biometryType: BiometryType): string => {
    switch (biometryType) {
      case BiometryType.touchId:
        return 'Touch ID';
      case BiometryType.faceId:
        return 'Face ID';
      case BiometryType.fingerprintAuthentication:
        return 'Fingerprint';
      case BiometryType.faceAuthentication:
        return 'Face Authentication';
      case BiometryType.irisAuthentication:
        return 'Iris Authentication';
      default:
        return 'Biometric Authentication';
    }
  };

  return {
    checkAvailability,
    authenticate,
    getBiometryName,
  };
};
