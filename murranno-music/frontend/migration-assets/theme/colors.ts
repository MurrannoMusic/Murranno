/**
 * Color System for React Native
 * Matches the web CSS variables from index.css exactly
 * 
 * All colors are in RGB format for React Native compatibility
 * Original HSL values are noted in comments
 */

// Dark theme colors (default)
export const darkColors = {
  // Core
  background: 'rgb(8, 12, 21)', // hsl(222 84% 5%)
  foreground: 'rgb(248, 250, 252)', // hsl(210 40% 98%)
  
  // Card
  card: {
    DEFAULT: 'rgb(14, 21, 36)', // hsl(222 84% 8%)
    foreground: 'rgb(248, 250, 252)',
  },
  
  // Popover
  popover: {
    DEFAULT: 'rgb(14, 21, 36)',
    foreground: 'rgb(248, 250, 252)',
  },
  
  // Primary - Modern Purple
  primary: {
    DEFAULT: 'rgb(124, 58, 237)', // hsl(263 70% 50%)
    foreground: 'rgb(248, 250, 252)',
    glow: 'rgb(156, 89, 255)', // hsl(263 85% 60%)
  },
  
  // Secondary - Dark Cards
  secondary: {
    DEFAULT: 'rgb(30, 41, 59)', // hsl(217 32% 17%)
    foreground: 'rgb(226, 232, 240)', // hsl(210 40% 90%)
  },
  
  // Muted
  muted: {
    DEFAULT: 'rgb(26, 36, 51)', // hsl(217 32% 15%)
    foreground: 'rgb(148, 163, 184)', // hsl(215 20% 65%)
  },
  
  // Accent - Bright Purple
  accent: {
    DEFAULT: 'rgb(139, 92, 246)', // hsl(262 83% 58%)
    foreground: 'rgb(248, 250, 252)',
  },
  
  // Destructive
  destructive: {
    DEFAULT: 'rgb(127, 29, 29)', // hsl(0 62% 30%)
    foreground: 'rgb(248, 250, 252)',
  },
  
  // Border & Input
  border: 'rgb(30, 41, 59)', // hsl(217 32% 17%)
  input: 'rgb(30, 41, 59)',
  ring: 'rgb(124, 58, 237)', // hsl(263 70% 50%)
  
  // Status Colors
  success: {
    DEFAULT: 'rgb(34, 197, 94)', // hsl(142 71% 45%)
    foreground: 'rgb(248, 250, 252)',
  },
  warning: {
    DEFAULT: 'rgb(245, 158, 11)', // hsl(38 92% 50%)
    foreground: 'rgb(248, 250, 252)',
  },
  
  // Sidebar
  sidebar: {
    DEFAULT: 'rgb(10, 15, 26)', // hsl(222 84% 6%)
    foreground: 'rgb(248, 250, 252)',
    primary: 'rgb(124, 58, 237)',
    primaryForeground: 'rgb(248, 250, 252)',
    accent: 'rgb(30, 41, 59)',
    accentForeground: 'rgb(226, 232, 240)',
    border: 'rgb(30, 41, 59)',
    ring: 'rgb(124, 58, 237)',
  },
};

// Light theme colors
export const lightColors = {
  // Core
  background: 'rgb(250, 250, 250)', // hsl(0 0% 98%)
  foreground: 'rgb(8, 12, 21)', // hsl(222 84% 4%)
  
  // Card
  card: {
    DEFAULT: 'rgb(255, 255, 255)', // hsl(0 0% 100%)
    foreground: 'rgb(8, 12, 21)',
  },
  
  // Popover
  popover: {
    DEFAULT: 'rgb(255, 255, 255)',
    foreground: 'rgb(8, 12, 21)',
  },
  
  // Primary - Modern Purple (same as dark)
  primary: {
    DEFAULT: 'rgb(124, 58, 237)',
    foreground: 'rgb(250, 250, 250)',
    glow: 'rgb(156, 89, 255)',
  },
  
  // Secondary
  secondary: {
    DEFAULT: 'rgb(241, 245, 249)', // hsl(210 40% 95%)
    foreground: 'rgb(15, 23, 42)', // hsl(222 84% 10%)
  },
  
  // Muted
  muted: {
    DEFAULT: 'rgb(244, 246, 248)', // hsl(210 40% 96%)
    foreground: 'rgb(100, 116, 139)', // hsl(215 16% 47%)
  },
  
  // Accent
  accent: {
    DEFAULT: 'rgb(139, 92, 246)',
    foreground: 'rgb(250, 250, 250)',
  },
  
  // Destructive
  destructive: {
    DEFAULT: 'rgb(239, 68, 68)', // hsl(0 84% 60%)
    foreground: 'rgb(250, 250, 250)',
  },
  
  // Border & Input
  border: 'rgb(226, 232, 240)', // hsl(214 32% 91%)
  input: 'rgb(226, 232, 240)',
  ring: 'rgb(124, 58, 237)',
  
  // Status Colors
  success: {
    DEFAULT: 'rgb(34, 197, 94)',
    foreground: 'rgb(250, 250, 250)',
  },
  warning: {
    DEFAULT: 'rgb(245, 158, 11)',
    foreground: 'rgb(250, 250, 250)',
  },
  
  // Sidebar
  sidebar: {
    DEFAULT: 'rgb(250, 250, 250)',
    foreground: 'rgb(8, 12, 21)',
    primary: 'rgb(124, 58, 237)',
    primaryForeground: 'rgb(250, 250, 250)',
    accent: 'rgb(241, 245, 249)',
    accentForeground: 'rgb(15, 23, 42)',
    border: 'rgb(226, 232, 240)',
    ring: 'rgb(124, 58, 237)',
  },
};

// Default export uses dark theme
export const colors = darkColors;

// Color with opacity helpers
export const withOpacity = (color: string, opacity: number): string => {
  // Handle rgb format
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
  }
  return color;
};

// Common opacity variations
export const colorVariants = {
  primary: {
    10: withOpacity(colors.primary.DEFAULT, 0.1),
    15: withOpacity(colors.primary.DEFAULT, 0.15),
    20: withOpacity(colors.primary.DEFAULT, 0.2),
    30: withOpacity(colors.primary.DEFAULT, 0.3),
    40: withOpacity(colors.primary.DEFAULT, 0.4),
    50: withOpacity(colors.primary.DEFAULT, 0.5),
  },
  card: {
    40: withOpacity(colors.card.DEFAULT, 0.4),
    60: withOpacity(colors.card.DEFAULT, 0.6),
    80: withOpacity(colors.card.DEFAULT, 0.8),
    90: withOpacity(colors.card.DEFAULT, 0.9),
  },
  background: {
    80: withOpacity(colors.background, 0.8),
    90: withOpacity(colors.background, 0.9),
    95: withOpacity(colors.background, 0.95),
  },
  border: {
    20: withOpacity(colors.border, 0.2),
    30: withOpacity(colors.border, 0.3),
    50: withOpacity(colors.border, 0.5),
  },
  secondary: {
    30: withOpacity(colors.secondary.DEFAULT, 0.3),
    50: withOpacity(colors.secondary.DEFAULT, 0.5),
  },
  foreground: {
    70: withOpacity(colors.foreground, 0.7),
    80: withOpacity(colors.foreground, 0.8),
    90: withOpacity(colors.foreground, 0.9),
  },
};

// Type exports
export type ColorScheme = 'dark' | 'light';
export type ThemeColors = typeof darkColors;

export default colors;
