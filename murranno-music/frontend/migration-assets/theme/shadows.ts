/**
 * Shadow System - React Native
 * Matches the CSS shadow variables from index.css
 */

import { Platform, ViewStyle } from 'react-native';

// Shadow definitions for iOS
const iosShadows = {
  primary: {
    shadowColor: 'rgb(124, 58, 237)',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
  },
  secondary: {
    shadowColor: 'rgb(8, 12, 21)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  accent: {
    shadowColor: 'rgb(139, 92, 246)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
  },
  glow: {
    shadowColor: 'rgb(156, 89, 255)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 60,
  },
  soft: {
    shadowColor: 'rgb(8, 12, 21)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
};

// Android elevation approximations
const androidElevations = {
  primary: 24,
  secondary: 8,
  accent: 16,
  glow: 12,
  soft: 4,
  none: 0,
};

// Cross-platform shadow function
export const getShadow = (type: keyof typeof iosShadows): ViewStyle => {
  if (Platform.OS === 'ios') {
    return iosShadows[type];
  }
  return {
    elevation: androidElevations[type],
  };
};

// Pre-built shadow styles
export const shadows = {
  primary: getShadow('primary'),
  secondary: getShadow('secondary'),
  accent: getShadow('accent'),
  glow: getShadow('glow'),
  soft: getShadow('soft'),
  none: getShadow('none'),
};

// Card shadow with hover effect simulation
export const cardShadow = {
  default: shadows.soft,
  pressed: shadows.primary,
};

// Button shadows
export const buttonShadow = {
  default: shadows.primary,
  pressed: shadows.glow,
};

// FAB shadow
export const fabShadow = shadows.accent;

// Modal/Sheet shadow
export const modalShadow = {
  ...shadows.secondary,
  shadowOpacity: 0.5,
};

export type ShadowKey = keyof typeof shadows;
