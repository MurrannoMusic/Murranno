/**
 * React Native Theme Context
 * Manages light/dark theme with system preference detection
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  colors: typeof lightColors;
}

const lightColors = {
  background: 'hsl(0, 0%, 100%)',
  foreground: 'hsl(240, 10%, 3.9%)',
  card: 'hsl(0, 0%, 100%)',
  cardForeground: 'hsl(240, 10%, 3.9%)',
  primary: 'hsl(262.1, 83.3%, 57.8%)',
  primaryForeground: 'hsl(0, 0%, 98%)',
  secondary: 'hsl(240, 4.8%, 95.9%)',
  secondaryForeground: 'hsl(240, 5.9%, 10%)',
  muted: 'hsl(240, 4.8%, 95.9%)',
  mutedForeground: 'hsl(240, 3.8%, 46.1%)',
  accent: 'hsl(240, 4.8%, 95.9%)',
  accentForeground: 'hsl(240, 5.9%, 10%)',
  destructive: 'hsl(0, 84.2%, 60.2%)',
  destructiveForeground: 'hsl(0, 0%, 98%)',
  border: 'hsl(240, 5.9%, 90%)',
  input: 'hsl(240, 5.9%, 90%)',
  ring: 'hsl(262.1, 83.3%, 57.8%)',
};

const darkColors = {
  background: 'hsl(240, 10%, 3.9%)',
  foreground: 'hsl(0, 0%, 98%)',
  card: 'hsl(240, 10%, 3.9%)',
  cardForeground: 'hsl(0, 0%, 98%)',
  primary: 'hsl(263.4, 70%, 50.4%)',
  primaryForeground: 'hsl(0, 0%, 98%)',
  secondary: 'hsl(240, 3.7%, 15.9%)',
  secondaryForeground: 'hsl(0, 0%, 98%)',
  muted: 'hsl(240, 3.7%, 15.9%)',
  mutedForeground: 'hsl(240, 5%, 64.9%)',
  accent: 'hsl(240, 3.7%, 15.9%)',
  accentForeground: 'hsl(0, 0%, 98%)',
  destructive: 'hsl(0, 62.8%, 30.6%)',
  destructiveForeground: 'hsl(0, 0%, 98%)',
  border: 'hsl(240, 3.7%, 15.9%)',
  input: 'hsl(240, 3.7%, 15.9%)',
  ring: 'hsl(263.4, 70%, 50.4%)',
};

const THEME_KEY = '@murranno_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine actual theme based on mode
  const theme = themeMode === 'system' 
    ? (systemColorScheme || 'dark') 
    : themeMode;
  
  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Force re-render when system theme changes
      if (themeMode === 'system') {
        setThemeModeState('system');
      }
    });

    return () => subscription.remove();
  }, [themeMode]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        isDark,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for styled components
export const useThemedStyles = <T extends Record<string, any>>(
  styleFactory: (colors: typeof lightColors, isDark: boolean) => T
): T => {
  const { colors, isDark } = useTheme();
  return styleFactory(colors, isDark);
};
