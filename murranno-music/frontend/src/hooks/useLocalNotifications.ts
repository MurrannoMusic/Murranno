import { useEffect, useState } from 'react';
import { 
  LocalNotifications, 
  ScheduleOptions,
  LocalNotificationSchema,
  ActionPerformed 
} from '@capacitor/local-notifications';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

export const useLocalNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) return;

    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      const permission = await LocalNotifications.checkPermissions();
      
      if (permission.display === 'prompt') {
        const result = await LocalNotifications.requestPermissions();
        setHasPermission(result.display === 'granted');
      } else {
        setHasPermission(permission.display === 'granted');
      }

      // Listen for notification actions
      await LocalNotifications.addListener('localNotificationActionPerformed', 
        (notification: ActionPerformed) => {
          console.log('Notification action performed:', notification);
          // Handle notification tap
          if (notification.notification.extra?.route) {
            window.location.href = notification.notification.extra.route;
          }
        }
      );
    } catch (error) {
      console.error('Failed to initialize local notifications:', error);
    }
  };

  const scheduleNotification = async (
    title: string,
    body: string,
    delayInSeconds: number,
    extra?: Record<string, any>
  ): Promise<boolean> => {
    if (!isNativeApp()) {
      toast.error('Local notifications are only available in the native app');
      return false;
    }

    if (!hasPermission) {
      toast.error('Notification permission not granted');
      return false;
    }

    try {
      const notificationId = Math.floor(Math.random() * 100000);
      const schedule: ScheduleOptions = {
        notifications: [
          {
            title,
            body,
            id: notificationId,
            schedule: { at: new Date(Date.now() + delayInSeconds * 1000) },
            extra: extra || {},
          },
        ],
      };

      await LocalNotifications.schedule(schedule);
      return true;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      toast.error('Failed to schedule notification');
      return false;
    }
  };

  const scheduleTrackUploadComplete = async (trackTitle: string) => {
    return scheduleNotification(
      'Upload Complete! 🎵',
      `"${trackTitle}" has been uploaded successfully`,
      0,
      { route: '/app/releases' }
    );
  };

  const scheduleReleaseReminder = async (releaseTitle: string, releaseDate: Date) => {
    const now = new Date();
    const delayInSeconds = Math.floor((releaseDate.getTime() - now.getTime()) / 1000);

    if (delayInSeconds <= 0) return false;

    return scheduleNotification(
      'Release Day! 🎉',
      `"${releaseTitle}" is now live!`,
      delayInSeconds,
      { route: '/app/releases' }
    );
  };

  const cancelAllNotifications = async () => {
    if (!isNativeApp()) return;

    try {
      await LocalNotifications.cancel({ notifications: [] });
      toast.success('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  };

  const getPendingNotifications = async () => {
    if (!isNativeApp()) return [];

    try {
      const result = await LocalNotifications.getPending();
      return result.notifications;
    } catch (error) {
      console.error('Failed to get pending notifications:', error);
      return [];
    }
  };

  return {
    hasPermission,
    scheduleNotification,
    scheduleTrackUploadComplete,
    scheduleReleaseReminder,
    cancelAllNotifications,
    getPendingNotifications,
  };
};
