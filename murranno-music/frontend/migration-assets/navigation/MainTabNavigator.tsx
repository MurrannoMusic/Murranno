import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MainTabParamList } from './types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

// Stack navigators for each tab
import DashboardNavigator from './stacks/DashboardNavigator';
import ReleasesNavigator from './stacks/ReleasesNavigator';
import PromotionsNavigator from './stacks/PromotionsNavigator';
import EarningsNavigator from './stacks/EarningsNavigator';
import ProfileNavigator from './stacks/ProfileNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <Ionicons
      name={name}
      size={24}
      color={focused ? colors.primary : colors.mutedForeground}
    />
  </View>
);

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          >
            <View style={styles.tabBarBackground} />
          </BlurView>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: typography.fontSizes.xs,
          fontFamily: typography.fontFamily.medium,
          marginTop: -4,
        },
        tabBarItemStyle: {
          paddingTop: spacing[2],
        },
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ReleasesTab"
        component={ReleasesNavigator}
        options={{
          tabBarLabel: 'Releases',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'disc' : 'disc-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PromotionsTab"
        component={PromotionsNavigator}
        options={{
          tabBarLabel: 'Promotions',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'megaphone' : 'megaphone-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="EarningsTab"
        component={EarningsNavigator}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'wallet' : 'wallet-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${colors.card}CC`,
    borderTopWidth: 1,
    borderTopColor: `${colors.border}33`,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: `${colors.primary}15`,
    transform: [{ scale: 1.05 }],
  },
});

export default MainTabNavigator;
