import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  style,
  imageStyle,
}) => {
  const [imageError, setImageError] = useState(false);

  const getSizeStyles = (): { container: ViewStyle; text: { fontSize: number } } => {
    switch (size) {
      case 'sm':
        return {
          container: { width: 32, height: 32 },
          text: { fontSize: typography.fontSizes.xs },
        };
      case 'lg':
        return {
          container: { width: 56, height: 56 },
          text: { fontSize: typography.fontSizes.lg },
        };
      case 'xl':
        return {
          container: { width: 80, height: 80 },
          text: { fontSize: typography.fontSizes.xl },
        };
      default:
        return {
          container: { width: 40, height: 40 },
          text: { fontSize: typography.fontSizes.sm },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const showFallback = !src || imageError;

  const getFallbackText = () => {
    if (fallback) return fallback;
    if (alt) {
      const words = alt.split(' ');
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      }
      return alt.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      {showFallback ? (
        <View style={[styles.fallback, sizeStyles.container]}>
          <Text style={[styles.fallbackText, sizeStyles.text]}>
            {getFallbackText()}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: src }}
          style={[styles.image, sizeStyles.container, imageStyle]}
          onError={() => setImageError(true)}
          accessibilityLabel={alt}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 9999,
  },
  fallback: {
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  fallbackText: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.medium,
  },
});

export default Avatar;
