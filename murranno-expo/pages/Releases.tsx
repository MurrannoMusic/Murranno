import React, { useState, useMemo } from 'react';
import { EmptyState, ErrorState, ListSkeleton, NoResults } from '@/components/states/StateViews';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, TextInput,
} from 'react-native';
import { Search, Plus, Music2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { useReleases } from '@/hooks/useReleases';
import { ReleaseRow } from '@/components/dashboard/ReleaseRow';

// ─── helpers ──────────────────────────────────────────────────────────────────

type StatusFilter = string;

// ─── component ────────────────────────────────────────────────────────────────

export const Releases = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const { releases, loading, error, refetch } = useReleases();
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

    const FILTERS = ['All', ...new Set(releases.map(r => r.status || 'Draft'))];

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.foreground, fontSize: 32, fontWeight: '700', letterSpacing: -1 }}>Your music</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="New release" onPress={() => router.push('/app/upload')} style={{ backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}><Plus size={20} color={colors.onPrimary} /></Pressable>
                </View>
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
                        return (
                            <Pressable
                                key={filter}
                                style={[
                                    s.filterChip,
                                    isActive && { backgroundColor: colors.secondary, borderColor: colors.border },
                                ]}
                                onPress={() => setStatusFilter(filter)}
                            >
                                <Text style={[s.filterChipText, isActive && { color: colors.primary }]}>
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
                {loading && !releases.length ? (
                    <ListSkeleton rows={5} />
                ) : error && !releases.length ? (
                    <ErrorState error={error} title="Couldn’t load your releases" onRetry={refetch} />
                ) : releases.length === 0 ? (
                    <EmptyState icon={Music2} title="No releases yet" body="Upload your first single, EP or album and we’ll send it to 150+ stores." action={{ label: 'Create a release', to: '/app/upload' }} />
                ) : filtered.length === 0 ? (
                    <NoResults what="releases" query={searchQuery.trim() || undefined} onClear={() => { setSearchQuery(''); setStatusFilter('All'); }} />
                ) : (
                    <View style={s.grid}>
                        {filtered.map(release => <ReleaseRow key={release.id} release={release} />)}
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
        scrollContent: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, gap: 14, paddingTop: 4 },

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
            paddingHorizontal: 14, paddingVertical: 13,
            borderRadius: 12, borderWidth: 1, borderColor: colors.border,
            marginRight: 6,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        },
        filterChipText: { fontSize: 12, fontWeight: '600', color: colors.foreground },

        sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.foreground },

        centred: { paddingVertical: 48, alignItems: 'center' },
        emptyText: { fontSize: 13, color: colors.mutedForeground },

        // Grid
        grid: { gap: 0 },
        releaseCard: {
            width: '47.5%',
            backgroundColor: colors.card,
            borderRadius: 10, borderWidth: 1, borderColor: colors.border,
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
