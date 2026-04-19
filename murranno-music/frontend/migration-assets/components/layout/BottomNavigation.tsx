/**
 * Bottom Navigation Component - React Native
 * Matches the web BottomNavigation component
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Home,
  Upload,
  Megaphone,
  DollarSign,
  BarChart3,
  Users,
  TrendingUp,
  Music,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing, borderRadius, componentSpacing } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';
import { spring } from '../../theme/animations';

// Icon mapping
const IconMap = {
  Home,
  Upload,
  Megaphone,
  DollarSign,
  BarChart3,
  Users,
  TrendingUp,
  Music,
};

type IconName = keyof typeof IconMap;

interface NavItem {
  icon: IconName;
  label: string;
  route: string;
}

interface BottomNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  userType: 'artist' | 'label' | 'agency';
}

const getNavItems = (userType: string): NavItem[] => {
  if (userType === 'artist') {
    return [
      { icon: 'Home', label: 'Home', route: 'ArtistDashboard' },
      { icon: 'BarChart3', label: 'Analytics', route: 'Analytics' },
      { icon: 'Music', label: 'Music', route: 'Releases' },
      { icon: 'DollarSign', label: 'Earnings', route: 'Earnings' },
      { icon: 'Upload', label: 'Upload', route: 'Upload' },
    ];
  }

  if (userType === 'label') {
    return [
      { icon: 'Home', label: 'Home', route: 'LabelDashboard' },
      { icon: 'Users', label: 'Artists', route: 'ArtistManagement' },
      { icon: 'Upload', label: 'Upload', route: 'Upload' },
      { icon: 'DollarSign', label: 'Payouts', route: 'PayoutManager' },
      { icon: 'TrendingUp', label: 'Analytics', route: 'LabelAnalytics' },
    ];
  }

  if (userType === 'agency') {
    return [
      { icon: 'Home', label: 'Home', route: 'AgencyDashboard' },
      { icon: 'Megaphone', label: 'Campaigns', route: 'CampaignTracking' },
      { icon: 'Upload', label: 'Create', route: 'Promotions' },
      { icon: 'BarChart3', label: 'Results', route: 'Results' },
    ];
  }

  return [{ icon: 'Home', label: 'Home', route: 'ArtistDashboard' }];
};

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({
  item,
  isActive,
  onPress,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const Icon = IconMap[item.icon];

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: isActive ? 1.1 : 1,
      ...spring.bouncy,
    }).start();
  }, [isActive, scaleValue]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.navItem, isActive && styles.navItemActive]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Icon
          size={20}
          color={isActive ? colors.dark.primary : colors.dark.mutedForeground}
          strokeWidth={2}
        />
      </Animated.View>
      <Text
        style={[
          styles.navLabel,
          textStyles.navLabel,
          { color: isActive ? colors.dark.primary : colors.dark.mutedForeground },
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentRoute,
  onNavigate,
  userType,
}) => {
  const insets = useSafeAreaInsets();
  const navItems = getNavItems(userType);
  const { width } = Dimensions.get('window');
  const maxWidth = Math.min(width, 400);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View style={[styles.navContainer, { maxWidth }]}>
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <NavItemComponent
                key={item.route}
                item={item}
                isActive={isActive}
                onPress={() => onNavigate(item.route)}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(8, 12, 21, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 41, 59, 0.2)',
    ...shadows.soft,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    alignSelf: 'center',
    width: '100%',
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[2],
    borderRadius: borderRadius.xl,
  },
  navItemActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  navLabel: {
    marginTop: spacing[0.5],
  },
});

export default BottomNavigation;
