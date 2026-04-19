/**
 * App Header Component - React Native
 * Matches the web AppHeader component with blur effect
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Bell, Settings } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { spacing, componentSpacing } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showNotification?: boolean;
  showSettings?: boolean;
  onBack?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
  notificationCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  showNotification = false,
  showSettings = false,
  onBack,
  onNotificationPress,
  onSettingsPress,
  leftElement,
  rightElement,
  transparent = false,
  style,
  notificationCount = 0,
}) => {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  };

  const handleNotification = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNotificationPress?.();
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettingsPress?.();
  };

  const headerContent = (
    <View style={[styles.content, { paddingTop: insets.top + spacing[2] }]}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.dark.foreground} strokeWidth={2} />
          </TouchableOpacity>
        )}
        {leftElement}
      </View>

      {/* Center Section - Title */}
      {(title || subtitle) && (
        <View style={styles.centerSection}>
          {title && (
            <Text style={[styles.title, textStyles.headingSm]} numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, textStyles.bodySm]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Right Section */}
      <View style={styles.rightSection}>
        {showNotification && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotification}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Bell size={24} color={colors.dark.foreground} strokeWidth={2} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {showSettings && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSettings}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Settings size={24} color={colors.dark.foreground} strokeWidth={2} />
          </TouchableOpacity>
        )}
        {rightElement}
      </View>
    </View>
  );

  if (transparent) {
    return (
      <View style={[styles.container, styles.transparent, style]}>
        {headerContent}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        {headerContent}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 41, 59, 0.2)',
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    minHeight: componentSpacing.headerHeight,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: spacing[2],
  },
  title: {
    color: colors.dark.foreground,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.dark.mutedForeground,
    textAlign: 'center',
    marginTop: spacing[0.5],
  },
  iconButton: {
    padding: spacing[2],
    borderRadius: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.dark.destructive,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.dark.foreground,
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AppHeader;
