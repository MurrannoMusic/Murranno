import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PromotionsStackParamList } from '../types';
import { colors } from '../../theme/colors';

const PlaceholderScreen = () => null;

const Stack = createNativeStackNavigator<PromotionsStackParamList>();

export const PromotionsNavigator: React.FC = () => {
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
        name="PromotionsList" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="CampaignTracking" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="CampaignPaymentSuccess" 
        component={PlaceholderScreen}
        options={{
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
};

export default PromotionsNavigator;
