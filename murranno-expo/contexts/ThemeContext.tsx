import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    resolvedScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({
    themeMode: 'system',
    setThemeMode: () => {},
    resolvedScheme: 'dark',
});

const STORAGE_KEY = '@murranno/themeMode';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useSystemScheme() ?? 'dark';
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((val) => {
            if (val === 'light' || val === 'dark' || val === 'system') {
                setThemeModeState(val as ThemeMode);
            }
        });
    }, []);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        AsyncStorage.setItem(STORAGE_KEY, mode);
    };

    const resolvedScheme: 'light' | 'dark' =
        themeMode === 'system' ? systemScheme : themeMode;

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, resolvedScheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => useContext(ThemeContext);
