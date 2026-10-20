import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
    const deviceScheme = useSystemScheme();
    const systemScheme = deviceScheme === 'light' ? 'light' : 'dark';
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const userSelectedTheme = useRef(false);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((val) => {
            if (!userSelectedTheme.current && (val === 'light' || val === 'dark' || val === 'system')) {
                setThemeModeState(val as ThemeMode);
            }
        }).catch(() => {});
    }, []);

    const setThemeMode = (mode: ThemeMode) => {
        userSelectedTheme.current = true;
        setThemeModeState(mode);
        AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
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
