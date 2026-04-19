/**
 * Agency Stack Navigator - React Native
 * Handles all agency-related screen navigation
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

// Import screens
import AgencyDashboardScreen from '../screens/AgencyDashboardScreen';
import PromotionsScreen from '../screens/PromotionsScreen';
import PromotionsDetailScreen from '../screens/PromotionsDetailScreen';
import CampaignTrackingScreen from '../screens/CampaignTrackingScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import WalletScreen from '../screens/WalletScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

// Placeholder for client management
import ReleasesScreen from '../screens/ReleasesScreen';

export type AgencyStackParamList = {
  AgencyDashboard: undefined;
  Campaigns: undefined;
  CampaignDetail: { campaignId: string };
  CampaignCreate: undefined;
  Clients: undefined;
  ClientDetail: { clientId: string };
  Analytics: undefined;
  Results: { campaignId: string };
  Wallet: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<AgencyStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
};

const AgencyStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="AgencyDashboard" component={AgencyDashboardScreen} />
      <Stack.Screen name="Campaigns" component={PromotionsScreen} />
      <Stack.Screen name="CampaignDetail" component={CampaignTrackingScreen} />
      <Stack.Screen 
        name="CampaignCreate" 
        component={PromotionsDetailScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Clients" component={ReleasesScreen} />
      <Stack.Screen name="ClientDetail" component={ReleasesScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Results" component={AnalyticsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

export default AgencyStackNavigator;
