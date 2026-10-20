import React from 'react';
import { EmptyState, ErrorState, ListSkeleton, StatSkeleton } from '@/components/states/StateViews';
import { View, Text, ScrollView, StyleSheet, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { Plus, ChevronRight, Music2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { useStats } from '@/hooks/useStats';
import { useReleases } from '@/hooks/useReleases';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useStreamAnalytics } from '@/hooks/useStreamAnalytics';
import { StreamChart } from '@/components/dashboard/StreamChart';
import { ReleaseRow } from '@/components/dashboard/ReleaseRow';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { KYCStatusBadge } from '@/components/dashboard/KYCStatusBadge';

export const AgencyDashboard = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { currency, setCurrency, formatAmount } = useCurrency();
    const { stats, loading, error: statsError, refetch: refetchStats } = useStats();
    const { releases, loading: releasesLoading, error: releasesError, refetch: refetchReleases } = useReleases();
    const { profile } = useArtistProfile();
    const { chartData, loading: chartLoading, error, refetch } = useStreamAnalytics(30);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <AppHeader />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <View style={s.heading}>
                <View style={{ flex: 1, gap: 6 }}><Text style={{ color: colors.mutedForeground, fontSize: 14 }}>{greeting}{profile?.stage_name ? `, ${profile.stage_name.split(' ')[0]}` : ''}</Text><Text style={[s.title, { color: colors.foreground }]}>Overview</Text></View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Currency ${currency}. Switch to ${currency === 'NGN' ? 'USD' : 'NGN'}`} style={[s.currency, { borderColor: colors.border }]} onPress={() => setCurrency(currency === 'NGN' ? 'USD' : 'NGN')}><Text style={{ color: colors.foreground, fontSize: 13 }}>{currency} ↕</Text></Pressable>
            </View>
            <KYCStatusBadge />
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Streams · Last 30 days</Text>
            {statsError ? <ErrorState error={statsError} title="Couldn’t load your numbers" onRetry={refetchStats} /> : loading ? <StatSkeleton /> : <View style={s.metrics}>
                {[{ label: 'Streams', value: stats.totalStreams.toLocaleString(), sub: 'Across all releases' }, { label: 'Earnings', value: formatAmount(stats.totalEarnings), sub: 'Lifetime reported royalties' }].map((item, i) => <View key={item.label} style={[s.metric, i === 1 && { borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 20 }]}>
                    <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>{item.label}</Text>
                    <Text adjustsFontSizeToFit numberOfLines={1} style={[s.value, { color: colors.foreground }]}>{item.value}</Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{item.sub}</Text>
                </View>)}
            </View>}
            {error ? <ErrorState error={error} title="Couldn’t load your stream chart" onRetry={refetch} /> : <StreamChart data={chartData} loading={chartLoading} />}
            <Pressable accessibilityRole="button" onPress={() => router.push('/app/upload')} style={({ pressed }) => [s.primary, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}><Plus size={21} color={colors.onPrimary} /><Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '600' }}>New release</Text></Pressable>
            <View>
                <View style={s.section}><Text style={[s.sectionTitle, { color: colors.foreground }]}>Your releases</Text><Pressable accessibilityRole="button" style={s.link} onPress={() => router.push('/app/music')}><Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>View all</Text><ChevronRight size={16} color={colors.primary} /></Pressable></View>
                {releasesLoading && !releases.length ? <ListSkeleton rows={3} /> : releasesError && !releases.length ? <ErrorState error={releasesError} title="Couldn’t load your releases" onRetry={refetchReleases} /> : releases.length ? releases.slice(0, 3).map(release => <ReleaseRow key={release.id} release={release} />) : <EmptyState icon={Music2} title="Your music starts here" body="Create your first release to send your music to 150+ streaming stores." action={{ label: 'Create a release', to: '/app/upload' }} />}
            </View>
            <ActivityFeed />
        </ScrollView>
    </View>;
};
const s = StyleSheet.create({ content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 40, gap: 24 }, heading: { flexDirection: 'row', alignItems: 'center', gap: 12 }, title: { fontSize: 32, fontWeight: '700', letterSpacing: -1 }, currency: { minHeight: 44, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8, justifyContent: 'center' }, metrics: { flexDirection: 'row', gap: 16 }, metric: { flex: 1, gap: 8 }, value: { fontSize: 28, fontWeight: '600', letterSpacing: -1, fontVariant: ['tabular-nums'] }, primary: { minHeight: 52, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { fontSize: 21, fontWeight: '600', letterSpacing: -0.4 }, link: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4 }, empty: { paddingVertical: 24, gap: 8, borderBottomWidth: 1 } });
