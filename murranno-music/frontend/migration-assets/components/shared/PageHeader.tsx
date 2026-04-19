import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
    badge?: number;
  };
  rightActions?: Array<{
    icon: string;
    onPress: () => void;
    badge?: number;
  }>;
  variant?: 'default' | 'transparent' | 'dark';
  style?: ViewStyle;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightAction,
  rightActions,
  variant = 'default',
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'transparent':
        return 'transparent';
      case 'dark':
        return colors.background;
      default:
        return colors.background;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'dark':
        return colors.foreground;
      default:
        return colors.foreground;
    }
  };

  const getButtonBackground = () => {
    switch (variant) {
      case 'transparent':
        return colors.background + '80';
      default:
        return colors.card;
    }
  };

  const allRightActions = rightActions || (rightAction ? [rightAction] : []);

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
      <View style={styles.leftSection}>
        {showBack && onBack && (
          <TouchableOpacity 
            onPress={onBack} 
            style={[styles.iconButton, { backgroundColor: getButtonBackground() }]}
          >
            <Ionicons name="arrow-back" size={24} color={getTextColor()} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: getTextColor() }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {allRightActions.length > 0 && (
        <View style={styles.rightSection}>
          {allRightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.onPress}
              style={[styles.iconButton, { backgroundColor: getButtonBackground() }]}
            >
              <Ionicons name={action.icon as any} size={24} color={getTextColor()} />
              {action.badge !== undefined && action.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {action.badge > 99 ? '99+' : action.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  titleContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
});

export default PageHeader;
