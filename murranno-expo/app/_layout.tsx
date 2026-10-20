import { supabase } from '@/integrations/supabase/client';
import { watchDevicePush } from '@/lib/push';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import * as SystemUI from 'expo-system-ui';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { useTheme } from '@/hooks/useTheme';
import { useFonts } from 'expo-font';
import { NetworkStatus } from '@/components/app/NetworkStatus';

function Navigation() {
    const { colors, isDark } = useTheme();
    useEffect(() => { SystemUI.setBackgroundColorAsync(colors.background).catch(() => {}); }, [colors.background]);
    useEffect(() => {
        let cleanup: (() => void) | undefined; let disposed = false;
        const start = async () => { cleanup?.(); cleanup = undefined; const {data} = await supabase.auth.getSession(); if (data.session) { const stop = await watchDevicePush().catch(() => undefined); if (disposed) stop?.(); else cleanup = stop; } };
        void start(); const {data} = supabase.auth.onAuthStateChange(() => { setTimeout(() => { if (!disposed) void start(); }, 0); });
        return () => { disposed = true; cleanup?.(); data.subscription.unsubscribe(); };
    }, []);
    const base = isDark ? DarkTheme : DefaultTheme;
    return <NavigationThemeProvider value={{ ...base, colors: { ...base.colors, background: colors.background, card: colors.card, text: colors.foreground, border: colors.border, primary: colors.primary, notification: colors.primary } }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="index" /><Stack.Screen name="welcome" /><Stack.Screen name="sign-in" /><Stack.Screen name="sign-up" /><Stack.Screen name="modal" /><Stack.Screen name="app" />
        </Stack>
        <NetworkStatus />
    </NavigationThemeProvider>;
}
export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({ Boldonse: require('../assets/fonts/Boldonse-Regular.ttf') });
    if (!fontsLoaded && !fontError) return null;
    return <ThemeProvider><CurrencyProvider><Navigation /></CurrencyProvider></ThemeProvider>;
}
