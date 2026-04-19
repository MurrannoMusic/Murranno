import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, TextInput, Image,
} from 'react-native';
import { Search, Music } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { useReleases } from '@/hooks/useReleases';

// ─── helpers ──────────────────────────────────────────────────────────────────

type StatusFilter = 'All' | 'Live' | 'Repair' | 'Takedown';

const STATUS_ACCENT: Record<StatusFilter, string> = {
    All:      '#9333ea',
    Live:     '#22c55e',
    Repair:   '#f59e0b',
    Takedown: '#ef4444',
};

// ─── component ────────────────────────────────────────────────────────────────

export const Releases = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const { releases, loading } = useReleases();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

    const getStatusCount = (status: StatusFilter) =>
        releases.filter((r) => r.status === status).length;

    const filtered = useMemo(() => {
        return releases.filter((r) => {
            const matchesSearch =
                r.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === 'All' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [releases, searchQuery, statusFilter]);

    const FILTERS: StatusFilter[] = ['All', 'Live', 'Repair', 'Takedown'];

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Search */}
                <View style={s.searchWrap}>
                    <Search size={16} color={colors.mutedForeground} style={s.searchIcon} />
                    <TextInput
                        style={s.searchInput}
                        placeholder="Search releases..."
                        placeholderTextColor={colors.mutedForeground}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Status Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
                    {FILTERS.map((filter) => {
                        const isActive = statusFilter === filter;
                        const accent = STATUS_ACCENT[filter];
                        return (
                            <Pressable
                                key={filter}
                                style={[
                                    s.filterChip,
                                    isActive && { backgroundColor: accent, borderColor: accent },
                                ]}
                                onPress={() => setStatusFilter(filter)}
                            >
                                <Text style={[s.filterChipText, isActive && { color: '#fff' }]}>
                                    {filter === 'All'
                                        ? 'All'
                                        : `${filter} (${getStatusCount(filter)})`}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Section title */}
                <Text style={s.sectionTitle}>Your Releases</Text>

                {/* Grid */}
                {loading ? (
                    <View style={s.centred}>
                        <ActivityIndicator color={colors.primaryGlow} size="large" />
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={s.centred}>
                        <Text style={s.emptyText}>No releases found</Text>
                    </View>
                ) : (
                    <View style={s.grid}>
                        {filtered.map((release) => {
                            const statusAccent = STATUS_ACCENT[release.status as StatusFilter] ?? '#9333ea';
                            return (
                                <Pressable
                                    key={release.id}
                                    style={s.releaseCard}
                                    onPress={() => router.push(`/app/releases/${release.id}` as any)}
                                >
                                    {/* Cover art */}
                                    <View style={s.coverWrap}>
                                        {release.coverArtUrl ? (
                                            <Image
                                                source={{ uri: release.coverArtUrl }}
                                                style={s.coverArt}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={s.coverPlaceholder}>
                                                <Music size={28} color={colors.mutedForeground} />
                                            </View>
                                        )}
                                        {/* Status badge */}
                                        <View style={[s.statusBadge, { backgroundColor: statusAccent }]}>
                                            <Text style={s.statusBadgeText}>{release.status}</Text>
                                        </View>
                                    </View>

                                    {/* Info */}
                                    <View style={s.releaseInfo}>
                                        <Text style={s.releaseTitle} numberOfLines={1}>{release.title}</Text>
                                        <Text style={s.releaseType} numberOfLines={1}>
                                            {release.releaseType?.toUpperCase()}
                                        </Text>
                                        <Text style={s.releaseMeta}>
                                            {release.releaseDate
                                                ? new Date(release.releaseDate).getFullYear()
                                                : '—'}{' '}
                                            • {release.genre ?? '—'}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ─── styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1 },
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 4 },

        // Search
        searchWrap: {
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            borderRadius: 14, borderWidth: 1, borderColor: colors.border,
            paddingHorizontal: 12, paddingVertical: 10,
        },
        searchIcon:  { marginRight: 8 },
        searchInput: { flex: 1, fontSize: 14, color: colors.foreground },

        // Filters
        filterScroll: { flexGrow: 0 },
        filterChip: {
            paddingHorizontal: 14, paddingVertical: 7,
            borderRadius: 20, borderWidth: 1, borderColor: colors.border,
            marginRight: 6,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        },
        filterChipText: { fontSize: 12, fontWeight: '600', color: colors.foreground },

        sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.foreground },

        centred: { paddingVertical: 48, alignItems: 'center' },
        emptyText: { fontSize: 13, color: colors.mutedForeground },

        // Grid
        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        releaseCard: {
            width: '47.5%',
            backgroundColor: colors.card,
            borderRadius: 16, borderWidth: 1, borderColor: colors.border,
            overflow: 'hidden',
        },

        // Cover
        coverWrap: { position: 'relative', aspectRatio: 1 },
        coverArt:  { width: '100%', height: '100%' },
        coverPlaceholder: {
            width: '100%', height: '100%',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            justifyContent: 'center', alignItems: 'center',
        },
        statusBadge: {
            position: 'absolute', top: 6, right: 6,
            paddingHorizontal: 6, paddingVertical: 2,
            borderRadius: 6,
        },
        statusBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },

        // Release info
        releaseInfo: { padding: 10, gap: 2 },
        releaseTitle: { fontSize: 12, fontWeight: '700', color: colors.foreground },
        releaseType:  { fontSize: 10, fontWeight: '600', color: colors.primaryGlow, letterSpacing: 0.8 },
        releaseMeta:  { fontSize: 10, color: colors.mutedForeground },
    });
