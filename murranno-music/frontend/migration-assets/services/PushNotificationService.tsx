/**
 * React Native Push Notification Service
 * Complete example with token registration, handling, and deep linking
 */

import { useEffect, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface PushNotificationState {
  token: string | null;
  notification: Notifications.Notification | null;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Register for push notifications
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    if (!Device.isDevice) {
      Alert.alert('Push notifications require a physical device');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission denied', 'Push notification permission was denied');
      return null;
    }

    // Get push token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with actual project ID
      });
      
      return tokenData.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }, []);

  // Save token to database
  const saveTokenToDatabase = useCallback(async (token: string) => {
    if (!user) return;

    try {
      // Check if token already exists
      const { data: existingToken } = await supabase
        .from('push_notification_tokens')
        .select('id')
        .eq('user_id', user.id)
        .eq('token', token)
        .single();

      if (existingToken) {
        // Update existing token
        await supabase
          .from('push_notification_tokens')
          .update({
            is_active: true,
            updated_at: new Date().toISOString(),
            device_info: {
              platform: Platform.OS,
              version: Platform.Version,
            },
          })
          .eq('id', existingToken.id);
      } else {
        // Insert new token
        await supabase
          .from('push_notification_tokens')
          .insert({
            user_id: user.id,
            token,
            platform: Platform.OS,
            is_active: true,
            device_info: {
              platform: Platform.OS,
              version: Platform.Version,
            },
          });
      }

      console.log('Push token saved successfully');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }, [user]);

  // Handle notification tap (deep linking)
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Navigate based on notification data
    if (data?.screen) {
      switch (data.screen) {
        case 'release':
          navigation.navigate('ReleaseDetails' as never, { releaseId: data.releaseId } as never);
          break;
        case 'campaign':
          navigation.navigate('CampaignDetails' as never, { campaignId: data.campaignId } as never);
          break;
        case 'earnings':
          navigation.navigate('Main' as never, { screen: 'Earnings' } as never);
          break;
        case 'notifications':
          navigation.navigate('Notifications' as never);
          break;
        default:
          console.log('Unknown screen:', data.screen);
      }
    }
  }, [navigation]);

  // Initialize push notifications
  useEffect(() => {
    if (!user) return;

    const initialize = async () => {
      const token = await registerForPushNotifications();
      if (token) {
        await saveTokenToDatabase(token);
      }
    };

    initialize();

    // Listen for notifications while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // You can update state here to show in-app notification
      }
    );

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Android-specific channel configuration
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });

      Notifications.setNotificationChannelAsync('releases', {
        name: 'Releases',
        description: 'Notifications about your music releases',
        importance: Notifications.AndroidImportance.HIGH,
      });

      Notifications.setNotificationChannelAsync('earnings', {
        name: 'Earnings',
        description: 'Updates about your earnings',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user, registerForPushNotifications, saveTokenToDatabase, handleNotificationResponse]);

  // Schedule a local notification (for testing or local reminders)
  const scheduleLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null = immediate
    });
  }, []);

  // Get badge count
  const getBadgeCount = useCallback(async () => {
    return await Notifications.getBadgeCountAsync();
  }, []);

  // Set badge count
  const setBadgeCount = useCallback(async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    await Notifications.dismissAllNotificationsAsync();
    await setBadgeCount(0);
  }, [setBadgeCount]);

  return {
    registerForPushNotifications,
    scheduleLocalNotification,
    getBadgeCount,
    setBadgeCount,
    clearAllNotifications,
  };
};

// Component to initialize push notifications
export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  usePushNotifications();
  return <>{children}</>;
};

export default usePushNotifications;
