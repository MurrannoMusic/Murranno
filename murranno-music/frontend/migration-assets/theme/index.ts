/**
 * Theme Index - React Native
 * Central export for all theme values
 * 
 * This provides a complete design system matching the web version
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './animations';
export * from './gradients';
export * from './utilities';

import { colors, darkColors, lightColors, colorVariants, withOpacity, ColorScheme, ThemeColors } from './colors';
import { textStyles, fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } from './typography';
import { spacing, borderRadius, componentSpacing } from './spacing';
import { shadows, getShadow } from './shadows';
import { timing, spring } from './animations';
import { gradients } from './gradients';
import { utilityStyles, textStyles as utilityTextStyles } from './utilities';

// Complete theme object
export const theme = {
  colors,
  darkColors,
  lightColors,
  colorVariants,
  withOpacity,
  gradients,
  textStyles,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  spacing,
  borderRadius,
  componentSpacing,
  shadows,
  timing,
  spring,
  utilityStyles,
  utilityTextStyles,
};

// Theme context type
export interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  toggleColorScheme: () => void;
}

export default theme;
