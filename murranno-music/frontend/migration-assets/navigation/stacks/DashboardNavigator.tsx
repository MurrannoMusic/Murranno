import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Placeholder - replace with actual screen imports
const PlaceholderScreen = () => null;

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardNavigator: React.FC = () => {
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
        name="ArtistDashboard" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="LabelDashboard" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="AgencyDashboard" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="UserTypeSelection" 
        component={PlaceholderScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="UserTypeSwitcher" 
        component={PlaceholderScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="NewsDetail" 
        component={PlaceholderScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
