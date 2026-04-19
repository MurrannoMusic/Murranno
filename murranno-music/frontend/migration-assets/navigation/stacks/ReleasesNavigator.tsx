import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReleasesStackParamList } from '../types';
import { colors } from '../../theme/colors';

const PlaceholderScreen = () => null;

const Stack = createNativeStackNavigator<ReleasesStackParamList>();

export const ReleasesNavigator: React.FC = () => {
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
        name="ReleasesList" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="ReleaseDetail" 
        component={PlaceholderScreen}
      />
      <Stack.Screen 
        name="Upload" 
        component={PlaceholderScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
};

export default ReleasesNavigator;
