/**
 * Modern Stat Card Component - React Native
 * Matches the web ModernStatCard component
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles, fontSize, fontWeight } from '../../theme/typography';
import { spring, timing } from '../../theme/animations';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  onPress?: () => void;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  onPress,
  loading = false,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      ...timing.smooth,
    }).start();
  }, [fadeValue]);

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        ...spring.bouncy,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleValue, {
        toValue: 1,
        ...spring.bouncy,
      }).start();
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getChangeColor = () => {
    if (!change || change === 0) return colors.dark.mutedForeground;
    return change > 0 ? colors.dark.success : colors.dark.destructive;
  };

  const getChangeIcon = () => {
    if (!change || change === 0) {
      return <Minus size={12} color={colors.dark.mutedForeground} />;
    }
    return change > 0 ? (
      <TrendingUp size={12} color={colors.dark.success} />
    ) : (
      <TrendingDown size={12} color={colors.dark.destructive} />
    );
  };

  const content = (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }],
          opacity: fadeValue,
        },
      ]}
    >
      {/* Icon Container */}
      <View style={styles.iconContainer}>{icon}</View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, textStyles.bodySm]}>{title}</Text>
        
        {loading ? (
          <View style={styles.skeleton} />
        ) : (
          <Text style={[styles.value, textStyles.headingLg]}>{value}</Text>
        )}

        {/* Change indicator */}
        {change !== undefined && (
          <View style={styles.changeContainer}>
            {getChangeIcon()}
            <Text style={[styles.changeText, { color: getChangeColor() }]}>
              {change > 0 ? '+' : ''}
              {change}%
            </Text>
            {changeLabel && (
              <Text style={styles.changeLabel}>{changeLabel}</Text>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(14, 21, 36, 0.9)',
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.2)',
    padding: spacing[4],
    ...shadows.soft,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  content: {
    gap: spacing[1],
  },
  title: {
    color: colors.dark.mutedForeground,
  },
  value: {
    color: colors.dark.foreground,
    marginTop: spacing[1],
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[2],
  },
  changeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  changeLabel: {
    fontSize: fontSize.xs,
    color: colors.dark.mutedForeground,
  },
  skeleton: {
    height: 28,
    width: '60%',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: borderRadius.md,
    marginTop: spacing[1],
  },
});

export default StatCard;
