/**
 * Murranno design token system — mirrors index.css CSS variables.
 * All screens consume colors via useTheme() which returns the correct
 * palette for the current system color scheme.
 */

import { Platform } from 'react-native';

// ─── Palette ──────────────────────────────────────────────────────────────────

const palette = {
  primary:     '#7c3aed', // hsl(263 70% 50%)
  primaryGlow: '#9333ea', // hsl(263 85% 60%)
  accent:      '#8b5cf6', // hsl(262 83% 58%)
  fuchsia:     '#e879f9', // brand logo / pop color
  success:     '#22c55e', // hsl(142 71% 45%)
  warning:     '#f59e0b', // hsl(38 92% 50%)
  destructive: '#ef4444',
} as const;

// ─── Dark tokens (default theme) ─────────────────────────────────────────────

const dark = {
  background:          '#060c1f', // hsl(222 84% 5%)
  backgroundDeep:      '#040918',
  card:                '#0b1428', // hsl(222 84% 8%)
  cardHover:           '#101d36',

  foreground:          '#f8fafc', // hsl(210 40% 98%)
  mutedForeground:     '#8896a7', // hsl(215 20% 65%)

  border:              '#1e2a3a', // hsl(217 32% 17%)
  input:               '#1e2a3a',
  secondary:           '#1e2a3a',
  secondaryForeground: '#d0d9e6',

  ...palette,

  // Opacity utilities
  overlayLight:  'rgba(255,255,255,0.04)',
  overlayMedium: 'rgba(255,255,255,0.08)',
  borderOpacity: 'rgba(255,255,255,0.07)',

  // Tab bar
  tabBar:         '#060c1f',
  tabBarBorder:   '#1e2a3a',
  tabIconDefault: '#4a5568',
  tabIconSelected:'#9333ea',
} as const;

// ─── Light tokens ─────────────────────────────────────────────────────────────

const light = {
  background:          '#fafafa', // hsl(0 0% 98%)
  backgroundDeep:      '#f1f5f9',
  card:                '#ffffff',
  cardHover:           '#f8fafc',

  foreground:          '#05091a', // hsl(222 84% 4%)
  mutedForeground:     '#64748b', // hsl(215 16% 47%)

  border:              '#e2e8f0', // hsl(214 32% 91%)
  input:               '#e2e8f0',
  secondary:           '#f0f5ff', // hsl(210 40% 95%)
  secondaryForeground: '#1e293b',

  ...palette,

  // Opacity utilities
  overlayLight:  'rgba(0,0,0,0.03)',
  overlayMedium: 'rgba(0,0,0,0.06)',
  borderOpacity: 'rgba(0,0,0,0.06)',

  // Tab bar
  tabBar:         '#ffffff',
  tabBarBorder:   '#e2e8f0',
  tabIconDefault: '#94a3b8',
  tabIconSelected:'#7c3aed',
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
export type ThemeColors = typeof dark;

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
