/**
 * Spacing System - React Native
 * Matches Tailwind spacing scale
 */

// Base spacing unit (1 = 4px in Tailwind)
const baseUnit = 4;

export const spacing = {
  0: 0,
  0.5: baseUnit * 0.5,   // 2px
  1: baseUnit,           // 4px
  1.5: baseUnit * 1.5,   // 6px
  2: baseUnit * 2,       // 8px
  2.5: baseUnit * 2.5,   // 10px
  3: baseUnit * 3,       // 12px
  3.5: baseUnit * 3.5,   // 14px
  4: baseUnit * 4,       // 16px
  5: baseUnit * 5,       // 20px
  6: baseUnit * 6,       // 24px
  7: baseUnit * 7,       // 28px
  8: baseUnit * 8,       // 32px
  9: baseUnit * 9,       // 36px
  10: baseUnit * 10,     // 40px
  11: baseUnit * 11,     // 44px
  12: baseUnit * 12,     // 48px
  14: baseUnit * 14,     // 56px
  16: baseUnit * 16,     // 64px
  20: baseUnit * 20,     // 80px
  24: baseUnit * 24,     // 96px
  28: baseUnit * 28,     // 112px
  32: baseUnit * 32,     // 128px
  36: baseUnit * 36,     // 144px
  40: baseUnit * 40,     // 160px
  44: baseUnit * 44,     // 176px
  48: baseUnit * 48,     // 192px
  52: baseUnit * 52,     // 208px
  56: baseUnit * 56,     // 224px
  60: baseUnit * 60,     // 240px
  64: baseUnit * 64,     // 256px
  72: baseUnit * 72,     // 288px
  80: baseUnit * 80,     // 320px
  96: baseUnit * 96,     // 384px
};

// Border radius values (matching --radius: 1.5rem = 24px)
export const borderRadius = {
  none: 0,
  sm: 8,      // calc(var(--radius) - 4px)
  md: 12,     // calc(var(--radius) - 2px)
  DEFAULT: 16,
  lg: 24,     // var(--radius) = 1.5rem
  xl: 28,
  '2xl': 32,
  '3xl': 48,
  full: 9999,
};

// Component-specific spacing
export const componentSpacing = {
  // Card padding
  cardPadding: spacing[4],      // p-4 = 16px
  cardPaddingLg: spacing[6],    // p-6 = 24px
  
  // Container padding
  containerPadding: spacing[4], // px-4 = 16px
  
  // Gap between items
  gap: {
    xs: spacing[1],             // gap-1 = 4px
    sm: spacing[2],             // gap-2 = 8px
    md: spacing[4],             // gap-4 = 16px
    lg: spacing[6],             // gap-6 = 24px
    xl: spacing[8],             // gap-8 = 32px
  },
  
  // Icon sizes
  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
  },
  
  // Button heights
  buttonHeight: {
    sm: 32,
    md: 40,    // h-10 = 40px
    lg: 48,
    xl: 56,
  },
  
  // Input heights
  inputHeight: {
    sm: 32,
    md: 40,    // h-10 = 40px
    lg: 48,
  },
  
  // Navigation
  bottomNavHeight: 72,          // py-3 + content
  headerHeight: 56,
  
  // Safe areas (will be overridden by device)
  safeAreaTop: spacing[8],      // pt-8 = 32px
  safeAreaBottom: spacing[20],  // pb-20 = 80px
};

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
