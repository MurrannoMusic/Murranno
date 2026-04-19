import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  style,
  textStyle,
}) => {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.secondary,
          },
          text: {
            color: colors.secondaryForeground,
          },
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: colors.destructive,
          },
          text: {
            color: colors.destructiveForeground,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.border,
          },
          text: {
            color: colors.foreground,
          },
        };
      case 'success':
        return {
          container: {
            backgroundColor: colors.success,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'warning':
        return {
          container: {
            backgroundColor: colors.warning,
          },
          text: {
            color: '#000000',
          },
        };
      default:
        return {
          container: {
            backgroundColor: colors.primary,
          },
          text: {
            color: colors.primaryForeground,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, variantStyles.container, style]}>
      <Text style={[styles.text, variantStyles.text, textStyle]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[0.5],
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    lineHeight: typography.fontSizes.xs * 1.4,
  },
});

export default Badge;
