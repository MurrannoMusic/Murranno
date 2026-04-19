import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EarningsStackParamList } from '../types';
import { colors } from '../../theme/colors';

const PlaceholderScreen = () => null;

const Stack = createNativeStackNavigator<EarningsStackParamList>();

export const EarningsNavigator: React.FC = () => {
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
        name="EarningsOverview" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="Analytics" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="LabelAnalytics" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="AgencyAnalytics" 
        component={PlaceholderScreen}
      />
    </Stack.Navigator>
  );
};

export default EarningsNavigator;
