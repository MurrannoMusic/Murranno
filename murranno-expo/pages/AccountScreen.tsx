import React, { useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { ChevronRight, User, Music2, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { AppHeader } from '@/components/layout/AppHeader';

export const AccountScreen = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { profile, loading } = useArtistProfile();

    const displayName = profile
        ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.stage_name || 'Murranno Music'
        : 'Murranno Music';

    const email = profile?.email ?? '';

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

                {/* Artist Profile card */}
                <View style={s.sectionHeader}>
                    <User size={15} color={colors.mutedForeground} />
                    <Text style={s.sectionLabel}>Artist Profile</Text>
                </View>

                <Pressable style={s.profileCard} onPress={() => router.push('/app/profile' as any)}>
                    {loading ? (
                        <ActivityIndicator color={colors.primaryGlow} />
                    ) : (
                        <>
                            <View style={s.avatarCircle}>
                                <User size={28} color={colors.mutedForeground} />
                            </View>
                            <View style={s.profileInfo}>
                                <Text style={s.profileName}>{displayName}</Text>
                                <Text style={s.artistBadge}>ARTIST</Text>
                                {!!email && <Text style={s.profileEmail}>{email}</Text>}
                            </View>
                        </>
                    )}
                </Pressable>

                {/* Streaming Links card */}
                <View style={[s.sectionHeader, { marginTop: 16 }]}>
                    <Music2 size={15} color={colors.mutedForeground} />
                    <Text style={s.sectionLabel}>Streaming Links</Text>
                </View>

                <View style={s.card}>
                    <Text style={s.streamingEmpty}>
                        Connect your profiles to help us track your stats
                    </Text>
                    <Pressable
                        style={s.addLinkBtn}
                        onPress={() => Alert.alert('Streaming Links', 'Streaming link management coming soon.')}
                    >
                        <Plus size={14} color={colors.primaryGlow} />
                        <Text style={s.addLinkText}>Add Streaming Links</Text>
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
        scrollContent:{ paddingHorizontal: 16, paddingTop: 8 },

        back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, marginBottom: 4 },
        backText: { fontSize: 14, color: colors.foreground, fontWeight: '500' },

        sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
        sectionLabel:  { fontSize: 12, fontWeight: '700', color: colors.mutedForeground, letterSpacing: 0.8, textTransform: 'uppercase' },

        profileCard: {
            flexDirection: 'row', alignItems: 'center', gap: 14,
            backgroundColor: colors.card, borderRadius: 16,
            borderWidth: 1, borderColor: colors.border,
            padding: 16,
        },
        avatarCircle: {
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 1, borderColor: colors.border,
        },
        profileInfo:  { flex: 1, gap: 2 },
        profileName:  { fontSize: 16, fontWeight: '700', color: colors.foreground },
        artistBadge:  { fontSize: 11, fontWeight: '700', color: colors.primaryGlow, letterSpacing: 0.6 },
        profileEmail: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },

        card: {
            backgroundColor: colors.card, borderRadius: 16,
            borderWidth: 1, borderColor: colors.border,
            padding: 20, alignItems: 'center', gap: 14,
        },
        streamingEmpty: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },
        addLinkBtn: {
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingVertical: 10, paddingHorizontal: 20,
            borderRadius: 10, borderWidth: 1, borderColor: colors.primaryGlow,
        },
        addLinkText: { fontSize: 13, fontWeight: '600', color: colors.primaryGlow },
    });
}
