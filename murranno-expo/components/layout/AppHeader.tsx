import React, { useState, useMemo } from 'react'; // useState kept for showDropdown
import {
    View, Text, Image, StyleSheet, Pressable, Modal,
} from 'react-native';
import { User, Settings, LogOut, Sun, Moon, Monitor } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { supabase } from '@/integrations/supabase/client';

interface AppHeaderProps {
    /** Show the NGN/USD currency toggle */
    showCurrencyToggle?: boolean;
}

export const AppHeader = ({ showCurrencyToggle = true }: AppHeaderProps) => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { themeMode, setThemeMode } = useThemeContext();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const { currency, setCurrency } = useCurrency();
    const [showDropdown, setShowDropdown] = useState(false);
    const { profile } = useArtistProfile();

    const handleLogout = async () => {
        setShowDropdown(false);
        await supabase.auth.signOut();
        router.replace('/sign-in' as any);
    };

    const getInitials = (name: string) => {
        if (!name) return 'MU';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <View style={s.header}>
            {/* Logo */}
            <Image
                source={require('@/assets/images/logo.png')}
                style={s.logo}
                resizeMode="contain"
            />

            <View style={s.right}>
                {/* Currency toggle */}
                {showCurrencyToggle && (
                    <View style={s.currencyToggle}>
                        {(['NGN', 'USD'] as Currency[]).map((c) => (
                            <Pressable
                                key={c}
                                style={[s.currencyBtn, currency === c && s.currencyBtnActive]}
                                onPress={() => setCurrency(c)}
                            >
                                <Text style={[s.currencyText, currency === c && s.currencyTextActive]}>
                                    {c}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Avatar / Dropdown trigger */}
                <Pressable style={s.avatar} onPress={() => setShowDropdown(true)}>
                    {profile?.profile_image ? (
                        <Image source={{ uri: profile.profile_image }} style={s.avatarImg} />
                    ) : (
                        <Text style={s.avatarText}>{getInitials(profile?.stage_name || 'Murranno User')}</Text>
                    )}
                </Pressable>
            </View>

            {/* Dropdown */}
            <Modal
                visible={showDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDropdown(false)}
            >
                <Pressable style={s.overlay} onPress={() => setShowDropdown(false)}>
                    <View style={s.dropdown}>
                        <Text style={s.dropdownName}>{profile?.stage_name || 'Murranno Music'}</Text>
                        <View style={s.dropdownDivider} />

                        {[
                            { label: 'Artist Profile', Icon: User,     route: '/app/profile' },
                            { label: 'Account',        Icon: User,     route: '/app/account' },
                            { label: 'Settings',       Icon: Settings,  route: '/app/settings' },
                        ].map(({ label, Icon, route }) => (
                            <Pressable
                                key={label}
                                style={s.dropdownItem}
                                onPress={() => { setShowDropdown(false); router.push(route as any); }}
                            >
                                <Icon size={16} color={colors.mutedForeground} />
                                <Text style={s.dropdownItemText}>{label}</Text>
                            </Pressable>
                        ))}

                        <View style={s.dropdownDivider} />

                        {/* Theme pills */}
                        <View style={s.themeRow}>
                            <Pressable
                                style={[s.themeBtn, themeMode === 'light' && s.themeBtnActive]}
                                onPress={() => setThemeMode('light')}
                            >
                                <Sun size={16} color={themeMode === 'light' ? colors.primaryGlow : colors.mutedForeground} />
                            </Pressable>
                            <Pressable
                                style={[s.themeBtn, themeMode === 'dark' && s.themeBtnActive]}
                                onPress={() => setThemeMode('dark')}
                            >
                                <Moon size={16} color={themeMode === 'dark' ? colors.primaryGlow : colors.mutedForeground} />
                            </Pressable>
                            <Pressable
                                style={[s.themeBtn, themeMode === 'system' && s.themeBtnActive]}
                                onPress={() => setThemeMode('system')}
                            >
                                <Monitor size={16} color={themeMode === 'system' ? colors.primaryGlow : colors.mutedForeground} />
                            </Pressable>
                        </View>

                        <View style={s.dropdownDivider} />

                        <Pressable style={s.dropdownItem} onPress={handleLogout}>
                            <LogOut size={16} color={colors.destructive} />
                            <Text style={[s.dropdownItemText, { color: colors.destructive }]}>Log out</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 16, paddingTop: 52, paddingBottom: 10,
            backgroundColor: colors.background,
        },
        logo: { width: 120, height: 36 },
        right: { flexDirection: 'row', alignItems: 'center', gap: 10 },

        // Currency toggle
        currencyToggle: {
            flexDirection: 'row',
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            borderRadius: 20, padding: 3, gap: 2,
        },
        currencyBtn: {
            paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16,
        },
        currencyBtnActive: {
            backgroundColor: colors.primaryGlow,
        },
        currencyText: { fontSize: 12, fontWeight: '700', color: colors.mutedForeground },
        currencyTextActive: { color: '#fff' },

        // Avatar
        avatar: {
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: colors.primaryGlow,
            justifyContent: 'center', alignItems: 'center',
            overflow: 'hidden',
        },
        avatarImg: { width: '100%', height: '100%' },
        avatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },

        // Dropdown
        overlay: { flex: 1 },
        dropdown: {
            position: 'absolute', top: 92, right: 16,
            backgroundColor: isDark ? '#101d36' : colors.card,
            borderRadius: 16, borderWidth: 1, borderColor: colors.border,
            paddingVertical: 8, minWidth: 200,
            shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
        },
        dropdownName: {
            fontSize: 14, fontWeight: '700', color: colors.foreground,
            paddingHorizontal: 16, paddingVertical: 10,
        },
        dropdownDivider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
        dropdownItem: {
            flexDirection: 'row', alignItems: 'center', gap: 10,
            paddingHorizontal: 16, paddingVertical: 12,
        },
        dropdownItemText: { fontSize: 14, color: colors.foreground },
        themeRow: {
            flexDirection: 'row', alignItems: 'center', gap: 8,
            paddingHorizontal: 16, paddingVertical: 10,
        },
        themeBtn: {
            width: 36, height: 36, borderRadius: 18,
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        },
        themeBtnActive: { backgroundColor: `${colors.primaryGlow}22` },
    });
