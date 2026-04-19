/**
 * Card Component - React Native
 * Matches the web Card component with glass morphism effects
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing, borderRadius } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';
import { spring } from '../../theme/animations';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'glass' | 'stat' | 'modern';
  pressable?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  pressable = false,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (pressable || onPress) {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        ...spring.bouncy,
      }).start();
    }
  }, [scaleValue, pressable, onPress]);

  const handlePressOut = useCallback(() => {
    if (pressable || onPress) {
      Animated.spring(scaleValue, {
        toValue: 1,
        ...spring.bouncy,
      }).start();
    }
  }, [scaleValue, pressable, onPress]);

  const handlePress = useCallback(() => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  }, [onPress]);

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: 'rgba(14, 21, 36, 0.4)',
          borderColor: 'rgba(30, 41, 59, 0.2)',
        };
      case 'stat':
        return {
          backgroundColor: 'rgba(14, 21, 36, 0.9)',
          borderColor: 'rgba(30, 41, 59, 0.2)',
        };
      case 'modern':
        return {
          backgroundColor: 'rgba(14, 21, 36, 0.8)',
          borderColor: 'rgba(30, 41, 59, 0.3)',
        };
      default:
        return {
          backgroundColor: 'rgba(14, 21, 36, 0.8)',
          borderColor: 'rgba(30, 41, 59, 0.2)',
        };
    }
  };

  const cardStyles: ViewStyle = {
    ...styles.base,
    ...getVariantStyles(),
    ...shadows.soft,
    ...style,
  };

  const content = (
    <Animated.View style={[cardStyles, { transform: [{ scale: scaleValue }] }]}>
      {variant === 'glass' ? (
        <BlurView intensity={20} style={styles.blurContainer}>
          {children}
        </BlurView>
      ) : (
        children
      )}
    </Animated.View>
  );

  if (pressable || onPress) {
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

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => (
  <View style={[styles.header, style]}>{children}</View>
);

export const CardTitle: React.FC<CardTitleProps> = ({ children, style }) => (
  <Text style={[styles.title, textStyles.headingMd, style]}>{children}</Text>
);

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, style }) => (
  <Text style={[styles.description, textStyles.bodySm, style]}>{children}</Text>
);

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => (
  <View style={[styles.content, style]}>{children}</View>
);

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius['3xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
  },
  header: {
    padding: spacing[4],
    gap: spacing[1],
  },
  title: {
    color: colors.dark.foreground,
  },
  description: {
    color: colors.dark.mutedForeground,
  },
  content: {
    padding: spacing[4],
    paddingTop: spacing[2],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    paddingTop: 0,
  },
});

export default Card;
