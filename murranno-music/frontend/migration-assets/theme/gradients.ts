/**
 * Gradient System for React Native
 * Mirrors web CSS gradient variables
 * 
 * Usage with expo-linear-gradient:
 * <LinearGradient colors={gradients.primary.colors} start={gradients.primary.start} end={gradients.primary.end} />
 */

import { colors } from './colors';

export interface GradientConfig {
  colors: string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
  locations?: number[];
}

// Primary gradient: linear-gradient(135deg, primary, accent)
export const gradientPrimary: GradientConfig = {
  colors: [colors.primary.DEFAULT, colors.accent.DEFAULT],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

// Secondary gradient: linear-gradient(135deg, secondary, card)
export const gradientSecondary: GradientConfig = {
  colors: [colors.secondary.DEFAULT, colors.card.DEFAULT],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

// Accent gradient: linear-gradient(135deg, accent, primary-glow)
export const gradientAccent: GradientConfig = {
  colors: [colors.accent.DEFAULT, colors.primary.glow],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

// Dark gradient: linear-gradient(135deg, background, muted)
export const gradientDark: GradientConfig = {
  colors: [colors.background, colors.muted.DEFAULT],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

// Glow gradient with transparency
export const gradientGlow: GradientConfig = {
  colors: ['rgba(156, 89, 255, 0.2)', 'rgba(139, 92, 246, 0.2)'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

// Mesh background gradient (vertical)
export const gradientMesh: GradientConfig = {
  colors: [
    'rgba(124, 58, 237, 0.1)', // primary with 10% opacity at top
    colors.background,
    colors.card.DEFAULT,
  ],
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
  locations: [0, 0.5, 1],
};

// Card overlay gradient
export const gradientCardOverlay: GradientConfig = {
  colors: ['rgba(14, 21, 36, 0)', 'rgba(14, 21, 36, 0.8)'],
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
};

// Button gradient
export const gradientButton: GradientConfig = {
  colors: [colors.primary.DEFAULT, colors.accent.DEFAULT],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

// Glass effect overlay
export const gradientGlass: GradientConfig = {
  colors: ['rgba(14, 21, 36, 0.4)', 'rgba(14, 21, 36, 0.6)'],
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
};

// Status gradients
export const gradientSuccess: GradientConfig = {
  colors: ['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

export const gradientWarning: GradientConfig = {
  colors: ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

export const gradientDestructive: GradientConfig = {
  colors: ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

// Export all gradients
export const gradients = {
  primary: gradientPrimary,
  secondary: gradientSecondary,
  accent: gradientAccent,
  dark: gradientDark,
  glow: gradientGlow,
  mesh: gradientMesh,
  cardOverlay: gradientCardOverlay,
  button: gradientButton,
  glass: gradientGlass,
  success: gradientSuccess,
  warning: gradientWarning,
  destructive: gradientDestructive,
};

export default gradients;
