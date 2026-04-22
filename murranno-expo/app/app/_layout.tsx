import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Home, BarChart2, Music2, DollarSign, Upload } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';

export default function AppLayout() {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        // Guard: redirect to sign-in if no session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) router.replace('/sign-in' as any);
        });

        // Listen for auth changes (e.g. logout from another tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) router.replace('/sign-in' as any);
        });
        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopColor: colors.tabBarBorder,
                    borderTopWidth: 1,
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom || 8,
                    paddingTop: 6,
                },
                tabBarActiveTintColor:   colors.tabIconSelected,
                tabBarInactiveTintColor: colors.tabIconDefault,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="music"
                options={{
                    title: 'Music',
                    tabBarIcon: ({ color, size }) => <Music2 size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="earnings"
                options={{
                    title: 'Earnings',
                    tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="upload"
                options={{
                    title: 'Upload',
                    tabBarIcon: ({ color, size }) => <Upload size={size} color={color} />,
                }}
            />

            {/* Hidden screens — accessible via navigation but not shown in tab bar */}
            <Tabs.Screen name="dashboard"  options={{ href: null }} />
            <Tabs.Screen name="releases"   options={{ href: null }} />
            <Tabs.Screen name="profile"    options={{ href: null }} />
            <Tabs.Screen name="kyc"        options={{ href: null }} />
            <Tabs.Screen name="settings"   options={{ href: null }} />
            <Tabs.Screen name="account"    options={{ href: null }} />
            <Tabs.Screen name="support"    options={{ href: null }} />
            <Tabs.Screen name="faq"        options={{ href: null }} />
            <Tabs.Screen name="privacy"        options={{ href: null }} />
            <Tabs.Screen name="terms"          options={{ href: null }} />
            <Tabs.Screen name="campaigns"      options={{ href: null }} />
            <Tabs.Screen name="campaigns/[id]" options={{ href: null }} />
            <Tabs.Screen name="subscriptions"  options={{ href: null }} />
        </Tabs>
    );
}
