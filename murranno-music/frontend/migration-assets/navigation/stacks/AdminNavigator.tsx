import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../types';
import { colors } from '../../theme/colors';

const PlaceholderScreen = () => null;

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminDashboard" component={PlaceholderScreen} />
      <Stack.Screen name="AdminUsers" component={PlaceholderScreen} />
      <Stack.Screen name="AdminContent" component={PlaceholderScreen} />
      <Stack.Screen name="AdminCampaigns" component={PlaceholderScreen} />
      <Stack.Screen name="AdminPromotions" component={PlaceholderScreen} />
      <Stack.Screen name="AdminPayments" component={PlaceholderScreen} />
      <Stack.Screen name="AdminFinancials" component={PlaceholderScreen} />
      <Stack.Screen name="AdminSubscriptions" component={PlaceholderScreen} />
      <Stack.Screen name="AdminAnalytics" component={PlaceholderScreen} />
      <Stack.Screen name="AdminNotifications" component={PlaceholderScreen} />
      <Stack.Screen name="AdminSettings" component={PlaceholderScreen} />
      <Stack.Screen name="AdminAuditLogs" component={PlaceholderScreen} />
      <Stack.Screen name="PreviewArtist" component={PlaceholderScreen} />
      <Stack.Screen name="PreviewLabel" component={PlaceholderScreen} />
      <Stack.Screen name="PreviewAgency" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
