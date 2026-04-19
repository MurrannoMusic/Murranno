/**
 * Label Stack Navigator - React Native
 * Handles all label-related screen navigation
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

// Import screens
import LabelDashboardScreen from '../screens/LabelDashboardScreen';
import ReleasesScreen from '../screens/ReleasesScreen';
import ReleaseDetailScreen from '../screens/ReleaseDetailScreen';
import UploadScreen from '../screens/UploadScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import WalletScreen from '../screens/WalletScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

// Placeholder screens for label-specific features
import ArtistProfileScreen from '../screens/ArtistProfileScreen';

export type LabelStackParamList = {
  LabelDashboard: undefined;
  ArtistRoster: undefined;
  ArtistDetail: { artistId: string };
  Releases: undefined;
  ReleaseDetail: { releaseId: string };
  Upload: undefined;
  Analytics: undefined;
  Wallet: undefined;
  PayoutManager: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<LabelStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
};

const LabelStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="LabelDashboard" component={LabelDashboardScreen} />
      <Stack.Screen name="ArtistRoster" component={ReleasesScreen} />
      <Stack.Screen name="ArtistDetail" component={ArtistProfileScreen} />
      <Stack.Screen name="Releases" component={ReleasesScreen} />
      <Stack.Screen name="ReleaseDetail" component={ReleaseDetailScreen} />
      <Stack.Screen 
        name="Upload" 
        component={UploadScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="PayoutManager" component={WalletScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

export default LabelStackNavigator;
