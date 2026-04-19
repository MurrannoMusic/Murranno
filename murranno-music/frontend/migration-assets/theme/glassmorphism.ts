/**
 * Glassmorphism Styles - React Native
 * Blur effects and glass-like UI patterns
 */

import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

// BlurView intensity presets for expo-blur
export const blurIntensity = {
  light: 20,
  medium: 40,
  heavy: 60,
  ultra: 80,
};

// Tint options for BlurView
export type BlurTint = 'light' | 'dark' | 'default' | 'extraLight' | 'regular' | 'prominent';

// Glass effect configurations
export interface GlassConfig {
  backgroundColor: string;
  borderColor: string;
  intensity: number;
  tint: BlurTint;
}

export const glassPresets: Record<string, GlassConfig> = {
  // Standard dark glass (most common)
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    intensity: blurIntensity.medium,
    tint: 'dark',
  },
  // Light glass for light mode
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    intensity: blurIntensity.medium,
    tint: 'light',
  },
  // Frosted effect
  frosted: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    intensity: blurIntensity.heavy,
    tint: 'default',
  },
  // Subtle glass
  subtle: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    intensity: blurIntensity.light,
    tint: 'dark',
  },
  // Card glass
  card: {
    backgroundColor: 'rgba(20, 20, 30, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    intensity: blurIntensity.medium,
    tint: 'dark',
  },
  // Modal glass
  modal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    intensity: blurIntensity.heavy,
    tint: 'dark',
  },
  // Header glass
  header: {
    backgroundColor: 'rgba(8, 12, 21, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    intensity: blurIntensity.medium,
    tint: 'dark',
  },
};

// Glass style factory
export const createGlassStyle = (preset: keyof typeof glassPresets): ViewStyle => {
  const config = glassPresets[preset];
  
  return {
    backgroundColor: config.backgroundColor,
    borderWidth: 1,
    borderColor: config.borderColor,
    overflow: 'hidden',
  };
};

// Pre-built glass styles
export const glassStyles: Record<string, ViewStyle> = {
  darkCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  lightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'rgba(8, 12, 21, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modal: {
    backgroundColor: 'rgba(20, 20, 30, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 28,
    overflow: 'hidden',
  },
  bottomSheet: {
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
  },
};

// Overlay styles
export const overlayStyles: Record<string, ViewStyle> = {
  dark: {
    ...Platform.select({
      ios: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      },
      android: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      },
    }),
  },
  light: {
    ...Platform.select({
      ios: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
      },
      android: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
      },
    }),
  },
};

// Backdrop blur fallback for Android (where BlurView may not work as well)
export const getBackdropStyle = (intensity: number = blurIntensity.medium): ViewStyle => {
  if (Platform.OS === 'android') {
    // Android fallback with more opacity since blur doesn't work as well
    return {
      backgroundColor: `rgba(0, 0, 0, ${Math.min(intensity / 100, 0.85)})`,
    };
  }
  
  return {
    backgroundColor: 'transparent',
  };
};

export default {
  blurIntensity,
  glassPresets,
  createGlassStyle,
  glassStyles,
  overlayStyles,
  getBackdropStyle,
};
