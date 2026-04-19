import React, { useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    StatusBar, Pressable, ActivityIndicator,
} from 'react-native';
import { TrendingUp, DollarSign, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { useUserType } from '@/hooks/useUserType';
import { useStats } from '@/hooks/useStats';
import { useReleases } from '@/hooks/useReleases';
import { AnalyticsCarousel } from '@/components/dashboard/AnalyticsCarousel';
import { DistributionStatus } from '@/components/dashboard/DistributionStatus';
import { TopTracksCard } from '@/components/dashboard/TopTracksCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { NewsCarousel } from '@/components/modern/NewsCarousel';

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
    `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;

const getCountdown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
        days: Math.floor(diff / 86400000),
        hrs:  Math.floor((diff % 86400000) / 3600000),
    };
};

// ─── component ────────────────────────────────────────────────────────────────

export const AgencyDashboard = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { loading: userLoading } = useUserType();
    const { stats, loading: statsLoading } = useStats();
    const { releases } = useReleases();

    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const upcomingRelease = useMemo(() => {
        const now = new Date();
        return releases
            .filter((r) => r.releaseDate && new Date(r.releaseDate) > now)
            .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime())[0] ?? null;
    }, [releases]);

    const countdown = upcomingRelease ? getCountdown(upcomingRelease.releaseDate) : null;

    const statsItems = useMemo(() => [
        {
            label: 'Earnings',
            value:  formatCurrency(stats.totalEarnings),
            Icon:   DollarSign,
            accent: colors.success,
            bg:     `${colors.success}1f`,
        },
        {
            label: 'Streams',
            value:  stats.totalStreams.toLocaleString(),
            Icon:   TrendingUp,
            accent: colors.primaryGlow,
            bg:     `${colors.primaryGlow}1f`,
        },
    ], [stats, colors]);

    if (userLoading) {
        return (
            <View style={s.loadingScreen}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
                <ActivityIndicator color={colors.primaryGlow} size="large" />
            </View>
        );
    }

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Upload prompt */}
                <Text style={s.uploadPrompt}>
                    Upload your first track to reach your next milestone
                </Text>

                {/* Upcoming Release Countdown */}
                {upcomingRelease && countdown && (
                    <Pressable style={s.countdownCard} onPress={() => router.push(`/app/releases/${upcomingRelease.id}` as any)}>
                        <View style={s.countdownLeft}>
                            <View style={s.countdownBadge}>
                                <Clock size={11} color="#818cf8" />
                                <Text style={s.countdownBadgeText}>UPCOMING RELEASE</Text>
                            </View>
                            <Text style={s.countdownTitle} numberOfLines={1}>{upcomingRelease.title}</Text>
                        </View>
                        <View style={s.countdownRight}>
                            {[{ n: countdown.days, u: 'Day' }, { n: countdown.hrs, u: 'Hrs' }].map(({ n, u }) => (
                                <View key={u} style={s.countdownBlock}>
                                    <Text style={s.countdownNum}>{n}</Text>
                                    <Text style={s.countdownUnit}>{u}</Text>
                                </View>
                            ))}
                        </View>
                    </Pressable>
                )}

                {/* Stats row */}
                <View style={s.statsRow}>
                    {statsItems.map(({ label, value, Icon, accent, bg }) => (
                        <View key={label} style={s.statCard}>
                            <View style={[s.statIconWrap, { backgroundColor: bg }]}>
                                <Icon size={16} color={accent} />
                            </View>
                            <Text style={[s.statValue, { color: accent }]}>{statsLoading ? '…' : value}</Text>
                            <Text style={s.statLabel}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* Distribution Status */}
                <DistributionStatus />

                {/* Performance carousel */}
                <View>
                    <Text style={s.sectionLabel}>Performance</Text>
                    <AnalyticsCarousel />
                </View>

                {/* Top Tracks */}
                <TopTracksCard />

                {/* News */}
                <View>
                    <Text style={s.sectionLabel}>News</Text>
                    <NewsCarousel />
                </View>

                {/* Activity */}
                <ActivityFeed />

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
};

// ─── dynamic styles ───────────────────────────────────────────────────────────

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen:       { flex: 1, backgroundColor: colors.background },
        loadingScreen:{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },

        // Scroll
        scroll: { flex: 1 },
        scrollContent: { paddingHorizontal: 16, gap: 20 },

        // Upload prompt
        uploadPrompt: {
            fontSize: 12, color: colors.mutedForeground,
            textAlign: 'center', paddingHorizontal: 8,
        },

        // Countdown
        countdownCard: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            padding: 16, borderRadius: 20,
            backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
            borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)',
        },
        countdownLeft:      { flex: 1, gap: 6 },
        countdownBadge:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
        countdownBadgeText: { fontSize: 10, fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', letterSpacing: 0.8 },
        countdownTitle:     { fontSize: 18, fontWeight: '800', color: colors.foreground },
        countdownRight:     { flexDirection: 'row', gap: 8 },
        countdownBlock: {
            alignItems: 'center', borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 10, minWidth: 52,
            backgroundColor: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.06)',
        },
        countdownNum:  { fontSize: 22, fontWeight: '800', color: colors.foreground, fontVariant: ['tabular-nums'] },
        countdownUnit: { fontSize: 9, fontWeight: '600', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5 },

        // Stats
        statsRow: { flexDirection: 'row', gap: 12 },
        statCard: {
            flex: 1, borderRadius: 20, padding: 16, gap: 6,
            backgroundColor: colors.card,
            borderWidth: 1, borderColor: colors.border,
        },
        statIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
        statValue:    { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
        statLabel:    { fontSize: 11, color: colors.mutedForeground, fontWeight: '500' },

        // Section label
        sectionLabel: {
            fontSize: 11, fontWeight: '600', color: colors.mutedForeground,
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
        },
    });
