import React, { useState } from 'react';
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from '@/components/states/StateViews';
import { View, Text, ScrollView, StyleSheet, StatusBar, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { useStreamAnalytics } from '@/hooks/useStreamAnalytics';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { StreamChart } from '@/components/dashboard/StreamChart';
import { TopTracksCard } from '@/components/dashboard/TopTracksCard';

const TABS = ['Streams', 'Tracks', 'Stores', 'Audience'] as const;
const PERIODS = [{ label: '7 days', days: 7 }, { label: '30 days', days: 30 }, { label: '90 days', days: 90 }, { label: 'Year', days: 365 }];
export const AnalyticsScreen = () => {
    const { colors, isDark } = useTheme();
    const [tab, setTab] = useState<typeof TABS[number]>('Streams');
    const [days, setDays] = useState(30);
    const { chartData, stats, loading, error, refetch } = useStreamAnalytics(days);
    const { data, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useAnalyticsData(days);
    const change = stats.percentageChange;
    return <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <AppHeader />
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            <Text style={[s.title, { color: colors.foreground }]}>Analytics</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 24 }} style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                {TABS.map(value => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: tab === value }} aria-selected={tab === value} onPress={() => setTab(value)} style={[s.tab, { borderBottomColor: tab === value ? colors.primary : 'transparent' }]}><Text style={{ color: tab === value ? colors.primary : colors.mutedForeground, fontSize: 14, fontWeight: '500' }}>{value}</Text></Pressable>)}
            </ScrollView>
            <View style={[s.periods, { backgroundColor: colors.secondary }]}>
                {PERIODS.map(period => <Pressable key={period.days} accessibilityRole="button" accessibilityState={{ selected: days === period.days }} aria-pressed={days === period.days} onPress={() => setDays(period.days)} style={[s.period, days === period.days && { backgroundColor: colors.background }]}><Text style={{ color: days === period.days ? colors.foreground : colors.mutedForeground, fontSize: 12, fontWeight: '600' }}>{period.label}</Text></Pressable>)}
            </View>
            <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{loading ? 'Loading reporting period…' : stats.currentDateRange}</Text>
            {error ? <ErrorState error={error} title="Couldn’t load your analytics" onRetry={refetch} /> : tab === 'Streams' ? <>
                <View style={{ gap: 8 }}>
                    <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Total reported streams</Text>
                    <Text style={[s.total, { color: colors.foreground }]}>{loading ? '' : stats.currentTotal.toLocaleString()}</Text>{loading && <Skeleton style={{ height: 44, width: 160 }} />}
                    {!loading && <Text style={{ color: change === null ? colors.mutedForeground : change >= 0 ? colors.success : colors.destructive, fontSize: 13 }}>{change === null ? 'No previous-period comparison available' : `${change >= 0 ? '↗ +' : '↘ '}${change}% vs previous ${days} days`}</Text>}
                </View>
                <View><Text style={[s.section, { color: colors.foreground }]}>Daily streams</Text><StreamChart data={chartData} loading={loading} /><Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 12 }}>Reported days only. Reporting times vary by store.</Text></View>
                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24 }}><TopTracksCard period={days} /></View>
            </> : tab === 'Tracks' ? <TopTracksCard period={days} /> : tab === 'Stores' || tab === 'Audience' ? summaryError ? <ErrorState error={summaryError} title="Couldn’t load your reports" onRetry={refetchSummary} /> : <View style={s.detail}>
                <Text style={[s.section, { color: colors.foreground }]}>{tab === 'Stores' ? 'Streams by store' : 'Streams by country'}</Text>
                {summaryLoading ? <ListSkeleton rows={4} media={false} /> : Object.entries(tab === 'Stores' ? data?.streamsByPlatform || {} : data?.streamsByCountry || {}).length ? Object.entries(tab === 'Stores' ? data?.streamsByPlatform || {} : data?.streamsByCountry || {}).sort(([,a],[,b])=>b-a).map(([name,streams]) => <View key={name} style={{gap:8,paddingVertical:8}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:colors.foreground}}>{name}</Text><Text style={{color:colors.mutedForeground}}>{streams.toLocaleString()}</Text></View><View style={{height:4,backgroundColor:colors.border,borderRadius:2}}><View style={{height:4,width:`${Math.min(100,streams / Math.max(1,data?.totalStreams || 0)*100)}%`,backgroundColor:colors.primary,borderRadius:2}}/></View></View>) : <EmptyState title="No reports for this period" body="Try a longer period, or check back once stores send new reports." />}

            </View> : <View style={s.detail}><Text style={[s.section, { color: colors.foreground }]}>Playlist reports</Text><Text style={{ color: colors.mutedForeground, lineHeight: 22 }}>Playlist placement data is not available yet.</Text></View>}
        </ScrollView>
    </View>;
};
const s = StyleSheet.create({ content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 40, gap: 24 }, title: { fontSize: 32, fontWeight: '700', letterSpacing: -1 }, tab: { paddingVertical: 14, borderBottomWidth: 2, minHeight: 48 }, periods: { flexDirection: 'row', borderRadius: 8, padding: 4 }, period: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 40, borderRadius: 6 }, total: { fontSize: 44, letterSpacing: -1.5, fontWeight: '600', fontVariant: ['tabular-nums'] }, section: { fontSize: 20, fontWeight: '600', marginBottom: 12 }, detail: { paddingVertical: 12, gap: 12 } });
