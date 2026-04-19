/**
 * useTheme()
 *
 * Returns the active color palette plus scale tokens.
 * Usage:
 *   const { colors, spacing, radius, fontSize } = useTheme();
 *   <View style={{ backgroundColor: colors.background }} />
 */

import { Colors, Spacing, Radius, FontSize, FontWeight, ThemeColors } from '@/constants/theme';
import { useThemeContext } from '@/contexts/ThemeContext';

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  spacing: typeof Spacing;
  radius: typeof Radius;
  fontSize: typeof FontSize;
  fontWeight: typeof FontWeight;
}

export const useTheme = (): Theme => {
  const { resolvedScheme } = useThemeContext();
  const isDark = resolvedScheme === 'dark';
  return {
    colors: isDark ? Colors.dark : Colors.light,
    isDark,
    spacing: Spacing,
    radius: Radius,
    fontSize: FontSize,
    fontWeight: FontWeight,
  };
};
