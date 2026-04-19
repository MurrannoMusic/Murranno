import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import { colors } from '../../theme/colors';

const PlaceholderScreen = () => null;

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
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
      <Stack.Screen 
        name="ProfileOverview" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="ArtistProfile" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="Settings" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="SubscriptionPlans" 
        component={PlaceholderScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
