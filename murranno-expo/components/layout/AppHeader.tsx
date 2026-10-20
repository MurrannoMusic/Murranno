import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Modal } from 'react-native';
import { User, Settings, LogOut, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { supabase } from '@/integrations/supabase/client';

export const AppHeader = ({ showCurrencyToggle = false }: { showCurrencyToggle?: boolean }) => {
    const router = useRouter();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { currency, setCurrency } = useCurrency();
    const { profile } = useArtistProfile();
    const [open, setOpen] = useState(false);
    const name = profile?.stage_name || 'Murranno artist';
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
        <View style={{ backgroundColor: colors.background, paddingTop: insets.top + 12 }}>
            <View style={s.header}>
                <Image source={require('@/assets/images/logo.png')} style={s.logo} resizeMode="contain" accessibilityLabel="Murranno" />
                <View style={s.actions}>
                    {showCurrencyToggle && <View style={[s.currency, { borderColor: colors.border }]}>
                        {(['NGN', 'USD'] as Currency[]).map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: currency === value }} onPress={() => setCurrency(value)} style={[s.currencyButton, currency === value && { backgroundColor: colors.secondary }]}>
                            <Text style={{ color: currency === value ? colors.foreground : colors.mutedForeground, fontSize: 12, fontWeight: '600' }}>{value}</Text>
                        </Pressable>)}
                    </View>}
                    <Pressable accessibilityRole="button" accessibilityLabel="Open account menu" onPress={() => setOpen(true)} style={[s.avatar, { backgroundColor: colors.secondary }]}>
                        {profile?.profile_image ? <Image source={{ uri: profile.profile_image }} style={s.avatarImage} /> : <Text style={{ color: colors.foreground, fontWeight: '600' }}>{initials}</Text>}
                    </Pressable>
                </View>
            </View>
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <View style={s.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Close account menu" onPress={() => setOpen(false)} />
                    <View style={[s.menu, { backgroundColor: colors.card, borderColor: colors.border, top: insets.top + 64 }]}>
                        <View style={s.menuHeader}>
                            <Text numberOfLines={1} style={{ color: colors.foreground, fontSize: 16, fontWeight: '600', flex: 1 }}>{name}</Text>
                            <Pressable accessibilityLabel="Close account menu" hitSlop={10} onPress={() => setOpen(false)}><X size={20} color={colors.mutedForeground} /></Pressable>
                        </View>
                        {[
                            { title: 'Artist profile', Icon: User, route: '/app/profile' },
                            { title: 'Account', Icon: User, route: '/app/account' },
                            { title: 'Settings', Icon: Settings, route: '/app/settings' },
                        ].map(({ title, Icon, route }) => <Pressable key={title} accessibilityRole="button" style={s.menuRow} onPress={() => { setOpen(false); router.push(route as any); }}>
                            <Icon size={18} color={colors.mutedForeground} /><Text style={{ color: colors.foreground, fontSize: 15 }}>{title}</Text>
                        </Pressable>)}
                        <Pressable accessibilityRole="button" style={[s.menuRow, { borderTopWidth: 1, borderTopColor: colors.border }]} onPress={async () => { setOpen(false); await supabase.auth.signOut(); router.replace('/sign-in' as any); }}>
                            <LogOut size={18} color={colors.mutedForeground} /><Text style={{ color: colors.foreground, fontSize: 15 }}>Sign out</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
const s = StyleSheet.create({
    header: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    logo: { width: 136, height: 38, flexShrink: 1 }, actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, avatarImage: { width: '100%', height: '100%' },
    currency: { flexDirection: 'row', borderWidth: 1, borderRadius: 8, padding: 2 }, currencyButton: { paddingHorizontal: 8, minHeight: 40, justifyContent: 'center', borderRadius: 6 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }, menu: { position: 'absolute', right: 24, width: 264, borderWidth: 1, borderRadius: 12, padding: 8 },
    menuHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }, menuRow: { minHeight: 48, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
