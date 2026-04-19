import { useEffect, useState, useCallback } from 'react';
import { AppUpdate, AppUpdateAvailability } from '@capawesome/capacitor-app-update';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

export const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [availableVersion, setAvailableVersion] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  const getAppUpdateInfo = useCallback(async () => {
    if (!isNativeApp()) {
      return null;
    }

    try {
      const result = await AppUpdate.getAppUpdateInfo();
      return result;
    } catch (error) {
      console.error('Failed to get app update info:', error);
      return null;
    }
  }, []);

  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    if (!isNativeApp()) {
      return false;
    }

    setIsChecking(true);
    try {
      const info = await getAppUpdateInfo();
      
      if (!info) {
        setIsChecking(false);
        return false;
      }

      setCurrentVersion(info.currentVersionCode?.toString() || info.currentVersionName || '');
      setAvailableVersion(info.availableVersionCode?.toString() || info.availableVersionName || '');

      const hasUpdate = info.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE;
      setUpdateAvailable(hasUpdate);
      setIsChecking(false);

      if (hasUpdate) {
        toast.info('A new version is available!', {
          description: `Version ${info.availableVersionName || 'latest'} is ready to download.`,
        });
      }

      return hasUpdate;
    } catch (error) {
      console.error('Failed to check for update:', error);
      setIsChecking(false);
      return false;
    }
  }, [getAppUpdateInfo]);

  const performImmediateUpdate = useCallback(async (): Promise<boolean> => {
    if (!isNativeApp()) {
      toast.error('App updates are only available in the native app');
      return false;
    }

    try {
      await AppUpdate.performImmediateUpdate();
      return true;
    } catch (error) {
      console.error('Failed to perform immediate update:', error);
      toast.error('Failed to update app. Please try again.');
      return false;
    }
  }, []);

  const openAppStore = useCallback(async (): Promise<void> => {
    if (!isNativeApp()) {
      toast.error('App store is only available in the native app');
      return;
    }

    try {
      await AppUpdate.openAppStore();
    } catch (error) {
      console.error('Failed to open app store:', error);
      toast.error('Failed to open app store');
    }
  }, []);

  const startFlexibleUpdate = useCallback(async (): Promise<boolean> => {
    if (!isNativeApp()) {
      toast.error('App updates are only available in the native app');
      return false;
    }

    try {
      await AppUpdate.startFlexibleUpdate();
      toast.success('Update download started in background');
      return true;
    } catch (error) {
      console.error('Failed to start flexible update:', error);
      toast.error('Failed to start update download');
      return false;
    }
  }, []);

  const completeFlexibleUpdate = useCallback(async (): Promise<void> => {
    if (!isNativeApp()) {
      return;
    }

    try {
      await AppUpdate.completeFlexibleUpdate();
    } catch (error) {
      console.error('Failed to complete flexible update:', error);
      toast.error('Failed to complete update');
    }
  }, []);

  // Auto-check for updates on mount
  useEffect(() => {
    checkForUpdate();
  }, []);

  return {
    updateAvailable,
    currentVersion,
    availableVersion,
    isChecking,
    checkForUpdate,
    performImmediateUpdate,
    openAppStore,
    startFlexibleUpdate,
    completeFlexibleUpdate,
    getAppUpdateInfo,
  };
};
