/**
 * Button Component - React Native
 * Matches the web Button component with all variants
 */

import React, { useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';
import { spring } from '../../theme/animations';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'pill' | 'glass';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'pill';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  disableHaptics?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  disableHaptics = false,
  onPress,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      ...spring.bouncy,
    }).start();
  }, [scaleValue]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      ...spring.bouncy,
    }).start();
  }, [scaleValue]);

  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      if (!disableHaptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress?.();
    }
  }, [disabled, loading, disableHaptics, onPress]);

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: colors.dark.primary,
          ...shadows.primary,
        };
      case 'destructive':
        return {
          backgroundColor: colors.dark.destructive,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.dark.border,
        };
      case 'secondary':
        return {
          backgroundColor: colors.dark.secondary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
        };
      case 'pill':
        return {
          backgroundColor: colors.dark.primary,
          ...shadows.primary,
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(30, 41, 59, 0.3)',
          borderWidth: 1,
          borderColor: 'rgba(30, 41, 59, 0.3)',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: spacing[3],
          borderRadius: borderRadius.md,
        };
      case 'lg':
        return {
          height: 44,
          paddingHorizontal: spacing[8],
          borderRadius: borderRadius.lg,
        };
      case 'icon':
        return {
          width: 40,
          height: 40,
          paddingHorizontal: 0,
          borderRadius: borderRadius.md,
        };
      case 'pill':
        return {
          height: 40,
          paddingHorizontal: spacing[6],
          borderRadius: borderRadius.full,
        };
      default:
        return {
          height: 40,
          paddingHorizontal: spacing[4],
          borderRadius: borderRadius.md,
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) {
      return colors.dark.mutedForeground;
    }
    switch (variant) {
      case 'default':
      case 'destructive':
      case 'pill':
        return colors.dark.primaryForeground;
      case 'outline':
      case 'secondary':
      case 'ghost':
      case 'glass':
        return colors.dark.foreground;
      case 'link':
        return colors.dark.primary;
      default:
        return colors.dark.primaryForeground;
    }
  };

  const buttonStyles: ViewStyle = {
    ...styles.base,
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...(disabled && styles.disabled),
    ...style,
  };

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          {typeof children === 'string' ? (
            <Text
              style={[
                styles.text,
                size === 'sm' ? textStyles.buttonSm : textStyles.buttonMd,
                { color: getTextColor() },
                variant === 'link' && styles.linkText,
                textStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </View>
  );

  // Use gradient for default and pill variants
  if ((variant === 'default' || variant === 'pill') && !disabled) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
        >
          <LinearGradient
            colors={['rgb(124, 58, 237)', 'rgb(139, 92, 246)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[buttonStyles, shadows.primary]}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={buttonStyles}
        activeOpacity={0.7}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {content}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
});

export default Button;
