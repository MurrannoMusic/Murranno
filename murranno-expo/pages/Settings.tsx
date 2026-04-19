import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, Switch, Alert,
} from 'react-native';
import {
    User, Mail, Lock, CreditCard, Shield, Bell, Sun,
    HelpCircle, Info, LogOut, Trash2, ChevronRight,
    ExternalLink, Moon, Monitor, RefreshCw,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { useThemeContext, ThemeMode } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/layout/AppHeader';

// ─── sub-components ──────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, label, colors }: { icon: any; label: string; colors: any }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 4 }}>
        <Icon size={15} color={colors.mutedForeground} />
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.mutedForeground, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            {label}
        </Text>
    </View>
);

// ─── component ────────────────────────────────────────────────────────────────

export const Settings = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { themeMode, setThemeMode } = useThemeContext();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const [notifs, setNotifs] = useState({
        email:    true,
        push:     true,
        inApp:    true,
        releases: true,
        campaign: true,
        earnings: true,
        marketing:false,
    });

    const toggle = (key: keyof typeof notifs) =>
        setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut();
                    router.replace('/sign-in' as any);
                },
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action is permanent. All your data, including music and earnings, will be wiped immediately.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Contact Support', 'Please contact support@murrannomusic.com to delete your account.') },
            ],
        );
    };

    const NOTIF_ROWS: { key: keyof typeof notifs; label: string; sub: string }[] = [
        { key: 'email',     label: 'Email Notifications',  sub: 'Receive updates via email' },
        { key: 'push',      label: 'Push Notifications',   sub: 'Get real-time alerts' },
        { key: 'inApp',     label: 'In-App Notifications', sub: 'Show alerts in app' },
        { key: 'releases',  label: 'Release Updates',      sub: 'Track status changes' },
        { key: 'campaign',  label: 'Campaign Updates',     sub: 'Promotion updates' },
        { key: 'earnings',  label: 'Earnings Alerts',      sub: 'Payment notifications' },
        { key: 'marketing', label: 'Marketing Emails',     sub: 'Product offers' },
    ];

    const THEME_PILLS: { mode: ThemeMode; Icon: any; label: string }[] = [
        { mode: 'light',  Icon: Sun,     label: 'Light'  },
        { mode: 'dark',   Icon: Moon,    label: 'Dark'   },
        { mode: 'system', Icon: Monitor, label: 'System' },
    ];

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Back */}
                <Pressable style={s.back} onPress={() => router.back()}>
                    <ChevronRight size={16} color={colors.foreground} style={{ transform: [{ rotate: '180deg' }] }} />
                    <Text style={s.backText}>Back</Text>
                </Pressable>

                {/* ── Account ──────────────────────────────────────────────── */}
                <SectionHeader icon={User} label="Account" colors={colors} />
                <View style={s.card}>
                    {[
                        { label: 'Edit Profile',     onPress: () => router.push('/app/profile' as any) },
                        { label: 'Change Email',     onPress: () => Alert.alert('Change Email', 'Email change will be sent to your current address.') },
                        { label: 'Change Password',  onPress: () => Alert.alert('Change Password', 'A password reset link will be sent to your email.') },
                    ].map(({ label, onPress }, i, arr) => (
                        <Pressable key={label} style={[s.row, i < arr.length - 1 && s.rowBorder]} onPress={onPress}>
                            <Text style={s.rowLabel}>{label}</Text>
                            <ChevronRight size={16} color={colors.mutedForeground} />
                        </Pressable>
                    ))}
                </View>

                {/* ── Subscription ─────────────────────────────────────────── */}
                <SectionHeader icon={CreditCard} label="Subscription" colors={colors} />
                <View style={s.card}>
                    <View style={s.subEmpty}>
                        <View style={s.subEmptyIcon}>
                            <CreditCard size={20} color={colors.mutedForeground} />
                        </View>
                        <Text style={s.subEmptyTitle}>No Active Subscription</Text>
                        <Text style={s.subEmptySub}>Upgrade to unlock premium features</Text>
                    </View>
                    <Pressable
                        style={s.primaryBtn}
                        onPress={() => Alert.alert('View Plans', 'Subscription plans coming soon.')}
                    >
                        <Text style={s.primaryBtnText}>View Plans</Text>
                    </Pressable>
                </View>

                {/* ── Security ─────────────────────────────────────────────── */}
                <SectionHeader icon={Shield} label="Security" colors={colors} />
                <View style={s.card}>
                    <View style={[s.row, s.rowBorder]}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.rowLabel}>Transaction PIN</Text>
                            <Text style={s.rowSub}>PIN not set</Text>
                            <Text style={[s.rowSub, { marginTop: 4, fontSize: 11 }]}>
                                Required for withdrawals and bank account modifications.
                            </Text>
                        </View>
                        <Pressable
                            style={s.outlineBtn}
                            onPress={() => Alert.alert('Set PIN', '4-digit PIN setup coming soon.')}
                        >
                            <Text style={s.outlineBtnText}>Set PIN</Text>
                        </Pressable>
                    </View>
                    <Pressable style={s.row} onPress={() => Alert.alert('Security Activity', 'No recent security events.')}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.rowLabel}>Recent Security Activity</Text>
                        </View>
                        <Text style={s.showText}>Show</Text>
                    </Pressable>
                </View>

                {/* ── Notifications ────────────────────────────────────────── */}
                <SectionHeader icon={Bell} label="Notifications" colors={colors} />
                <View style={s.card}>
                    {NOTIF_ROWS.map(({ key, label, sub }, i) => (
                        <View key={key} style={[s.row, i < NOTIF_ROWS.length - 1 && s.rowBorder]}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.rowLabel}>{label}</Text>
                                <Text style={s.rowSub}>{sub}</Text>
                            </View>
                            <Switch
                                value={notifs[key]}
                                onValueChange={() => toggle(key)}
                                trackColor={{ false: colors.border, true: colors.primaryGlow }}
                                thumbColor="#fff"
                            />
                        </View>
                    ))}
                </View>

                {/* ── Appearance ───────────────────────────────────────────── */}
                <SectionHeader icon={Sun} label="Appearance" colors={colors} />
                <View style={s.card}>
                    <View style={s.themeRow}>
                        {THEME_PILLS.map(({ mode, Icon, label }) => (
                            <Pressable
                                key={mode}
                                style={[s.themePill, themeMode === mode && s.themePillActive]}
                                onPress={() => setThemeMode(mode)}
                            >
                                <Icon
                                    size={15}
                                    color={themeMode === mode ? colors.primaryGlow : colors.mutedForeground}
                                />
                                <Text style={[s.themePillText, themeMode === mode && s.themePillTextActive]}>
                                    {label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* ── App Icon Badges ──────────────────────────────────────── */}
                <SectionHeader icon={Bell} label="App Icon Badges" colors={colors} />
                <View style={s.card}>
                    <Text style={[s.rowSub, { paddingVertical: 6 }]}>
                        Badge notifications are only available in the native mobile app
                    </Text>
                </View>

                {/* ── Help & Support ───────────────────────────────────────── */}
                <SectionHeader icon={HelpCircle} label="Help & Support" colors={colors} />
                <View style={s.card}>
                    {[
                        { label: 'FAQs',             route: '/app/faq'     },
                        { label: 'Contact Support',  route: '/app/support' },
                        { label: 'Terms of Service', route: '/app/terms'   },
                        { label: 'Privacy Policy',   route: '/app/privacy' },
                    ].map(({ label, route }, i, arr) => (
                        <Pressable
                            key={label}
                            style={[s.row, i < arr.length - 1 && s.rowBorder]}
                            onPress={() => router.push(route as any)}
                        >
                            <Text style={s.rowLabel}>{label}</Text>
                            <ExternalLink size={15} color={colors.mutedForeground} />
                        </Pressable>
                    ))}
                </View>

                {/* ── App Info ─────────────────────────────────────────────── */}
                <SectionHeader icon={Info} label="App Info" colors={colors} />
                <View style={s.card}>
                    <View style={[s.row, s.rowBorder]}>
                        <Text style={s.rowLabel}>Version</Text>
                        <Text style={s.rowMeta}>1.0.0</Text>
                    </View>
                    <Pressable
                        style={s.row}
                        onPress={() => Alert.alert('Check Updates', 'You are on the latest version.')}
                    >
                        <RefreshCw size={15} color={colors.mutedForeground} />
                        <Text style={[s.rowLabel, { marginLeft: 8 }]}>Check Updates</Text>
                    </Pressable>
                </View>

                {/* ── Sign Out ─────────────────────────────────────────────── */}
                <Pressable style={s.signOutBtn} onPress={handleLogout}>
                    <LogOut size={16} color={colors.foreground} />
                    <Text style={s.signOutText}>Sign Out</Text>
                </Pressable>

                {/* ── Danger Zone ──────────────────────────────────────────── */}
                <View style={s.dangerCard}>
                    <View style={s.dangerHeader}>
                        <Trash2 size={15} color={colors.destructive} />
                        <Text style={s.dangerTitle}>Danger Zone</Text>
                    </View>
                    <Text style={s.dangerSub}>
                        Deleting your account is permanent. All your data, including music and earnings, will be wiped immediately.
                    </Text>
                    <Pressable style={s.deleteBtn} onPress={handleDeleteAccount}>
                        <Text style={s.deleteBtnText}>Delete Account</Text>
                    </Pressable>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ─── styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
    return StyleSheet.create({
        screen:       { flex: 1, backgroundColor: colors.background },
        scroll:       { flex: 1 },
        scrollContent:{ paddingHorizontal: 16, paddingTop: 8, gap: 6, paddingBottom: 40 },

        back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, marginBottom: 8 },
        backText: { fontSize: 14, color: colors.foreground, fontWeight: '500' },

        card: {
            backgroundColor: colors.card, borderRadius: 16,
            borderWidth: 1, borderColor: colors.border,
            marginBottom: 8, overflow: 'hidden',
        },

        row: {
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 16, paddingVertical: 14, gap: 10,
        },
        rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
        rowLabel: { flex: 1, fontSize: 14, color: colors.foreground },
        rowSub:   { fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
        rowMeta:  { fontSize: 14, color: colors.mutedForeground },
        showText: { fontSize: 13, fontWeight: '600', color: colors.primaryGlow },

        // Subscription
        subEmpty: { alignItems: 'center', paddingTop: 20, paddingBottom: 12, gap: 6 },
        subEmptyIcon: {
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            justifyContent: 'center', alignItems: 'center',
            marginBottom: 4,
        },
        subEmptyTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
        subEmptySub:   { fontSize: 13, color: colors.mutedForeground },
        primaryBtn: {
            backgroundColor: colors.primaryGlow, marginHorizontal: 16, marginBottom: 16,
            borderRadius: 12, paddingVertical: 13, alignItems: 'center',
        },
        primaryBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

        // Security
        outlineBtn: {
            borderWidth: 1, borderColor: colors.primaryGlow, borderRadius: 10,
            paddingHorizontal: 14, paddingVertical: 7,
        },
        outlineBtnText: { fontSize: 13, fontWeight: '600', color: colors.primaryGlow },

        // Appearance
        themeRow: { flexDirection: 'row', gap: 8, padding: 14 },
        themePill: {
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
            paddingVertical: 10, borderRadius: 10,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        },
        themePillActive: { backgroundColor: `${colors.primaryGlow}22`, borderWidth: 1, borderColor: `${colors.primaryGlow}60` },
        themePillText:   { fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
        themePillTextActive: { color: colors.primaryGlow },

        // Help rows
        helpRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },

        // Sign Out
        signOutBtn: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
            backgroundColor: colors.card, borderRadius: 16,
            borderWidth: 1, borderColor: colors.border,
            paddingVertical: 14, marginBottom: 8,
        },
        signOutText: { fontSize: 15, fontWeight: '600', color: colors.foreground },

        // Danger Zone
        dangerCard: {
            backgroundColor: `${colors.destructive}0f`,
            borderWidth: 1, borderColor: `${colors.destructive}30`,
            borderRadius: 16, padding: 16, gap: 10,
        },
        dangerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        dangerTitle:  { fontSize: 14, fontWeight: '700', color: colors.destructive },
        dangerSub:    { fontSize: 12, color: colors.mutedForeground, lineHeight: 18 },
        deleteBtn: {
            backgroundColor: colors.destructive, borderRadius: 12,
            paddingVertical: 13, alignItems: 'center',
        },
        deleteBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
    });
}
