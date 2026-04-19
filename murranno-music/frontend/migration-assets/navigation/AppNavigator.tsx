/**
 * React Native App Navigator
 * Root navigation component that handles auth state routing
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Import navigators
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

// Import standalone screens
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ReleaseDetailsScreen } from '../screens/ReleaseDetailsScreen';
import { TrackUploadScreen } from '../screens/TrackUploadScreen';
import { CampaignDetailsScreen } from '../screens/CampaignDetailsScreen';
import { PromotionDetailsScreen } from '../screens/PromotionDetailsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  ReleaseDetails: { releaseId: string };
  TrackUpload: { releaseId: string };
  CampaignDetails: { campaignId: string };
  PromotionDetails: { serviceId?: string; bundleId?: string };
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, session, loading, hasCompletedOnboarding } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!session ? (
          // Not authenticated - show auth flow
          <>
            {!hasCompletedOnboarding && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        ) : (
          // Authenticated - show main app
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            
            {/* Modal screens accessible from anywhere */}
            <Stack.Screen
              name="ReleaseDetails"
              component={ReleaseDetailsScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="TrackUpload"
              component={TrackUploadScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="CampaignDetails"
              component={CampaignDetailsScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="PromotionDetails"
              component={PromotionDetailsScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
