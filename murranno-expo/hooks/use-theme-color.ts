/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors
) {
  const scheme = useColorScheme() ?? 'dark';
  const colorFromProps = props[scheme as 'light' | 'dark'];
  if (colorFromProps) return colorFromProps;
  return (Colors[scheme as 'light' | 'dark'] as ThemeColors)[colorName];
}
