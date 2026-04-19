/**
 * Artist Stack Navigator - React Native
 * Handles all artist-related screen navigation
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ReleasesScreen from '../screens/ReleasesScreen';
import ReleaseDetailScreen from '../screens/ReleaseDetailScreen';
import UploadScreen from '../screens/UploadScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import WalletScreen from '../screens/WalletScreen';
import PromotionsScreen from '../screens/PromotionsScreen';
import PromotionsDetailScreen from '../screens/PromotionsDetailScreen';
import CampaignTrackingScreen from '../screens/CampaignTrackingScreen';
import ArtistProfileScreen from '../screens/ArtistProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

export type ArtistStackParamList = {
  ArtistHome: undefined;
  Releases: undefined;
  ReleaseDetail: { releaseId: string };
  Upload: undefined;
  Analytics: undefined;
  Wallet: undefined;
  Promotions: undefined;
  PromotionDetail: { serviceId?: string; bundleId?: string };
  CampaignTracking: undefined;
  ArtistProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<ArtistStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
};

const ArtistStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ArtistHome" component={HomeScreen} />
      <Stack.Screen name="Releases" component={ReleasesScreen} />
      <Stack.Screen name="ReleaseDetail" component={ReleaseDetailScreen} />
      <Stack.Screen 
        name="Upload" 
        component={UploadScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Promotions" component={PromotionsScreen} />
      <Stack.Screen name="PromotionDetail" component={PromotionsDetailScreen} />
      <Stack.Screen name="CampaignTracking" component={CampaignTrackingScreen} />
      <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

export default ArtistStackNavigator;
