/**
 * Murranno design token system — mirrors index.css CSS variables.
 * All screens consume colors via useTheme() which returns the correct
 * palette for the current system color scheme.
 */

import { Platform } from 'react-native';

// ─── Palette ──────────────────────────────────────────────────────────────────

const palette = {
  primary:     '#7350b8',
  primaryGlow: '#7350b8',
  accent:      '#7350b8',
  fuchsia:     '#7350b8',
  success:     '#22c55e', // hsl(142 71% 45%)
  warning:     '#f59e0b', // hsl(38 92% 50%)
  destructive: '#ef4444',
} as const;

// ─── Dark tokens (default theme) ─────────────────────────────────────────────

const dark = {
  background:          '#111214',
  backgroundDeep:      '#0c0d0f',
  card:                '#1a1b1e',
  cardHover:           '#222327',

  foreground:          '#f5f4f7',
  mutedForeground:     '#a6a5af',

  border:              '#303136',
  input:               '#1a1b1e',
  secondary:           '#242529',
  secondaryForeground: '#d6d4dd',

  ...palette,
  primary: '#a895eb',
  primaryGlow: '#a895eb',
  accent: '#a895eb',
  onPrimary: '#171122',

  // Opacity utilities
  overlayLight:  'rgba(255,255,255,0.04)',
  overlayMedium: 'rgba(255,255,255,0.08)',
  borderOpacity: 'rgba(255,255,255,0.07)',

  // Tab bar
  tabBar:         '#111214',
  tabBarBorder:   '#303136',
  tabIconDefault: '#a6a5af',
  tabIconSelected:'#a895eb',
} as const;

// ─── Light tokens ─────────────────────────────────────────────────────────────

const light = {
  background:          '#faf9f6',
  backgroundDeep:      '#f0efec',
  card:                '#ffffff',
  cardHover:           '#f3f1ed',

  foreground:          '#202024',
  mutedForeground:     '#696770',

  border:              '#dedcd7',
  input:               '#ffffff',
  secondary:           '#eeece7',
  secondaryForeground: '#4d4a53',

  ...palette,
  onPrimary: '#ffffff',
  success: '#187247',
  warning: '#946000',
  destructive: '#bd323b',

  // Opacity utilities
  overlayLight:  'rgba(0,0,0,0.03)',
  overlayMedium: 'rgba(0,0,0,0.06)',
  borderOpacity: 'rgba(0,0,0,0.06)',

  // Tab bar
  tabBar:         '#faf9f6',
  tabBarBorder:   '#dedcd7',
  tabIconDefault: '#696770',
  tabIconSelected:'#7350b8',
} as const;

// ─── Shared scale tokens ──────────────────────────────────────────────────────

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, '3xl': 32,
} as const;

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999,
} as const;

export const FontSize = {
  xs: 10, sm: 12, base: 14, md: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 28, '4xl': 32,
} as const;

export const FontWeight = {
  normal:    '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const Colors = { dark, light };
export type ThemeColors = { [Key in keyof typeof dark]: string };

export const Fonts = Platform.select({
  ios:     { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal',    serif: 'serif',    rounded: 'normal',     mono: 'monospace'    },
  web:     {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
