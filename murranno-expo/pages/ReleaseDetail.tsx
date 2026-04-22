import React, { useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Music, TrendingUp, DollarSign } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useReleaseDetail } from '@/hooks/useReleaseDetail';
import { AudioPlayer } from '@/components/ui/AudioPlayer';

const STATUS_COLOR: Record<string, string> = {
    Live:      '#22c55e',
    Published: '#22c55e',
    Draft:     '#6b7280',
    Repair:    '#f59e0b',
    Takedown:  '#ef4444',
};

const formatNumber = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
};

const MetaRow = ({ label, value, colors }: { label: string; value: string | null | undefined; colors: any }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, maxWidth: '55%', textAlign: 'right' }}>
            {value || '—'}
        </Text>
    </View>
);

export const ReleaseDetailPage = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { release, loading } = useReleaseDetail(id);

    if (loading) {
        return (
            <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={colors.primaryGlow} size="large" />
            </View>
        );
    }

    if (!release) {
        return (
            <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.mutedForeground }}>Release not found.</Text>
                <Pressable style={s.backBtnAlt} onPress={() => router.back()}>
                    <Text style={{ color: colors.primaryGlow, fontWeight: '700' }}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    const statusColor = STATUS_COLOR[release.status] ?? '#9333ea';

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <View style={s.header}>
                <Pressable style={s.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={22} color={colors.foreground} />
                </Pressable>
                <Text style={s.headerTitle} numberOfLines={1}>Release Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero */}
                <View style={s.hero}>
                    {release.cover_art_url ? (
                        <Image source={{ uri: release.cover_art_url }} style={s.coverArt} resizeMode="cover" />
                    ) : (
                        <View style={[s.coverArt, s.coverPlaceholder]}>
                            <Music size={48} color={colors.mutedForeground} />
                        </View>
                    )}
                    <View style={s.heroInfo}>
                        <Text style={s.releaseTitle} numberOfLines={2}>{release.title}</Text>
                        <Text style={s.artistName}>{release.artist_name}</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                            <View style={[s.badge, { backgroundColor: statusColor }]}>
                                <Text style={s.badgeText}>{release.status}</Text>
                            </View>
                            <View style={[s.badge, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                                <Text style={[s.badgeText, { color: colors.foreground }]}>{release.release_type?.toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats row */}
                <View style={s.statsRow}>
                    <View style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TrendingUp size={18} color={colors.primaryGlow} />
                        <Text style={[s.statValue, { color: colors.foreground }]}>{formatNumber(release.total_streams)}</Text>
                        <Text style={[s.statLabel, { color: colors.mutedForeground }]}>Streams</Text>
                    </View>
                    <View style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <DollarSign size={18} color='#22c55e' />
                        <Text style={[s.statValue, { color: colors.foreground }]}>₦{formatNumber(release.total_earnings)}</Text>
                        <Text style={[s.statLabel, { color: colors.mutedForeground }]}>Earnings</Text>
                    </View>
                </View>

                {/* Tracks */}
                {release.tracks.length > 0 && (
                    <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Tracks ({release.tracks.length})</Text>
                        {release.tracks
                            .sort((a, b) => a.track_number - b.track_number)
                            .map((track) => (
                                <View key={track.id} style={s.trackItem}>
                                    {track.audio_url ? (
                                        <AudioPlayer
                                            uri={track.audio_url}
                                            title={`${track.track_number}. ${track.title}`}
                                            duration={track.duration}
                                        />
                                    ) : (
                                        <View style={[s.trackRow, { borderBottomColor: colors.border }]}>
                                            <Text style={[s.trackNum, { color: colors.mutedForeground }]}>{track.track_number}</Text>
                                            <Text style={[s.trackTitle, { color: colors.foreground }]} numberOfLines={1}>{track.title}</Text>
                                            <Text style={[s.trackStreams, { color: colors.mutedForeground }]}>{formatNumber(track.streams)} streams</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                    </View>
                )}

                {/* Metadata */}
                <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[s.sectionTitle, { color: colors.foreground }]}>Details</Text>
                    <MetaRow label="Release Date"   value={release.release_date ? new Date(release.release_date).toLocaleDateString() : null} colors={colors} />
                    <MetaRow label="Genre"          value={release.genre}          colors={colors} />
                    <MetaRow label="Language"       value={release.language}       colors={colors} />
                    <MetaRow label="Label"          value={release.label}          colors={colors} />
                    <MetaRow label="Copyright"      value={release.copyright}      colors={colors} />
                    <MetaRow label="UPC / EAN"      value={release.upc_ean}        colors={colors} />
                    <MetaRow label="ISRC"           value={release.isrc}           colors={colors} />
                    <MetaRow label="Recording Year" value={release.recording_year} colors={colors} />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen:        { flex: 1, backgroundColor: colors.background },
        scroll:        { flex: 1 },
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 8 },

        header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, flex: 1, textAlign: 'center' },
        backBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
        backBtnAlt:  { marginTop: 16, padding: 12 },

        hero:             { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
        coverArt:         { width: 110, height: 110, borderRadius: 12 },
        coverPlaceholder: { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
        heroInfo:         { flex: 1, gap: 4, paddingTop: 4 },
        releaseTitle:     { fontSize: 18, fontWeight: '800', color: colors.foreground },
        artistName:       { fontSize: 13, color: colors.mutedForeground },
        badge:            { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
        badgeText:        { fontSize: 10, fontWeight: '700', color: '#fff' },

        statsRow: { flexDirection: 'row', gap: 12 },
        statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4 },
        statValue:{ fontSize: 22, fontWeight: '800' },
        statLabel:{ fontSize: 11 },

        section:      { borderRadius: 16, borderWidth: 1, padding: 16 },
        sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },

        trackItem:   { marginBottom: 8 },
        trackRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
        trackNum:    { fontSize: 12, width: 18, textAlign: 'center' },
        trackTitle:  { flex: 1, fontSize: 13, fontWeight: '600' },
        trackStreams: { fontSize: 11 },
    });
