/**
 * Typography System - React Native
 * Matches the font styling from index.css
 */

import { Platform, TextStyle } from 'react-native';

// Font family configuration
export const fontFamily = {
  regular: Platform.select({
    ios: 'SF Pro Display',
    android: 'System',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'SF Pro Display',
    android: 'System',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'SF Pro Display',
    android: 'System',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'SF Pro Display',
    android: 'System',
    default: 'System',
  }),
};

// Font sizes matching Tailwind scale
export const fontSize = {
  xs: 12,      // text-xs
  sm: 14,      // text-sm
  base: 16,    // text-base
  lg: 18,      // text-lg
  xl: 20,      // text-xl
  '2xl': 24,   // text-2xl
  '3xl': 30,   // text-3xl
  '4xl': 36,   // text-4xl
  '5xl': 48,   // text-5xl
  '6xl': 60,   // text-6xl
};

// Line heights
export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// Letter spacing (tracking)
export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
};

// Font weights
export const fontWeight = {
  normal: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
};

// Pre-defined text styles matching CSS classes
export const textStyles = {
  // Heading styles
  headingXl: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeight.tight,
  } as TextStyle,
  
  headingLg: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeight.tight,
  } as TextStyle,
  
  headingMd: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  } as TextStyle,
  
  headingSm: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  } as TextStyle,
  
  // Body styles
  bodyLg: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
  } as TextStyle,
  
  bodyMd: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
  } as TextStyle,
  
  bodySm: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
  } as TextStyle,
  
  // Label styles
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
  } as TextStyle,
  
  labelSm: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
  } as TextStyle,
  
  // Button text
  buttonLg: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,
  
  buttonMd: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,
  
  buttonSm: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,
  
  // Special styles
  portfolioValue: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,
  
  portfolioChange: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  } as TextStyle,
  
  navLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  } as TextStyle,
  
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  } as TextStyle,
};

export type TextStyleKey = keyof typeof textStyles;
