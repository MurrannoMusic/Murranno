/**
 * Portfolio Card Component - React Native
 * Matches the web portfolio value display with gradient text
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { colors, gradients } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles, fontSize, fontWeight } from '../../theme/typography';
import { timing } from '../../theme/animations';

interface PortfolioCardProps {
  value: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  loading?: boolean;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  value,
  change,
  changeType = 'neutral',
  subtitle,
  loading = false,
}) => {
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeValue, {
        toValue: 1,
        ...timing.smooth,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 400,
        ...timing.bounce,
      }),
    ]).start();
  }, [fadeValue, scaleValue]);

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return colors.dark.success;
      case 'negative':
        return colors.dark.destructive;
      default:
        return colors.dark.mutedForeground;
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <TrendingUp size={16} color={colors.dark.success} />;
    }
    if (changeType === 'negative') {
      return <TrendingDown size={16} color={colors.dark.destructive} />;
    }
    return null;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeValue,
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      {/* Gradient Value with Masked View */}
      {loading ? (
        <View style={styles.skeleton} />
      ) : (
        <MaskedView
          maskElement={
            <Text style={styles.valueMask}>{value}</Text>
          }
        >
          <LinearGradient
            colors={gradients.primary.colors as any}
            start={gradients.primary.start}
            end={gradients.primary.end}
            style={styles.gradientContainer}
          >
            <Text style={[styles.value, { opacity: 0 }]}>{value}</Text>
          </LinearGradient>
        </MaskedView>
      )}

      {/* Change indicator */}
      {change !== undefined && (
        <View style={styles.changeContainer}>
          {getChangeIcon()}
          <Text style={[styles.changeText, { color: getChangeColor() }]}>
            {changeType === 'positive' ? '+' : ''}
            {change}%
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  gradientContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.4,
  },
  valueMask: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.4,
    color: 'black',
    backgroundColor: 'transparent',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    marginTop: spacing[2],
  },
  changeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.dark.mutedForeground,
  },
  skeleton: {
    height: 44,
    width: 200,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: borderRadius.lg,
  },
});

export default PortfolioCard;
