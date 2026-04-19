import React, { useState, useMemo, useRef } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, Dimensions,
} from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { useStreamAnalytics } from '@/hooks/useStreamAnalytics';

// ─── types ────────────────────────────────────────────────────────────────────

type TabId = 'streams' | 'tracks' | 'playlists' | 'stores' | 'audience';
type PeriodId = 'week' | 'month' | '90days' | 'year';

const TABS: { id: TabId; label: string }[] = [
    { id: 'streams',  label: 'Streams'  },
    { id: 'tracks',   label: 'Tracks'   },
    { id: 'playlists',label: 'Playlists'},
    { id: 'stores',   label: 'Stores'   },
    { id: 'audience', label: 'Audience' },
];

const PERIODS: { id: PeriodId; label: string; days: number }[] = [
    { id: 'week',   label: 'Week',    days: 7   },
    { id: 'month',  label: 'Month',   days: 30  },
    { id: '90days', label: '90 Days', days: 90  },
    { id: 'year',   label: 'Year',    days: 365 },
];

// ─── Bar Chart ────────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_H = 160;

interface BarChartProps {
    data: { label: string; streams: number; date?: string }[];
    accentColor: string;
    colors: any;
}

const BarChart = ({ data, accentColor, colors }: BarChartProps) => {
    if (data.length === 0) {
        return (
            <View style={{ height: CHART_H, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>No data for this period</Text>
            </View>
        );
    }

    const maxVal = Math.max(...data.map((d) => d.streams), 1);
    // Show at most 14 bars; if more, sample evenly
    const displayData = data.length <= 14 ? data : data.filter((_, i) => i % Math.ceil(data.length / 14) === 0);
    const barWidth = Math.floor((SCREEN_W - 64) / displayData.length) - 3;

    return (
        <View style={{ height: CHART_H + 24 }}>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((frac) => (
                <View
                    key={frac}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: CHART_H * (1 - frac),
                        height: 1,
                        backgroundColor: colors.border,
                        opacity: 0.5,
                    }}
                />
            ))}

            {/* Bars row */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H, gap: 3 }}>
                {displayData.map((d, i) => {
                    const heightFrac = maxVal > 0 ? d.streams / maxVal : 0;
                    const barH = Math.max(heightFrac * CHART_H, 4);
                    return (
                        <View
                            key={`${d.date ?? ''}-${i}`}
                            style={{
                                width: barWidth,
                                height: barH,
                                backgroundColor: accentColor,
                                borderRadius: 4,
                                opacity: 0.85,
                            }}
                        />
                    );
                })}
            </View>

            {/* X-axis labels: show first, middle, last */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
                    {displayData[0]?.label ?? ''}
                </Text>
                {displayData.length > 2 && (
                    <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
                        {displayData[Math.floor(displayData.length / 2)]?.label ?? ''}
                    </Text>
                )}
                <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
                    {displayData[displayData.length - 1]?.label ?? ''}
                </Text>
            </View>
        </View>
    );
};

// ─── component ────────────────────────────────────────────────────────────────

export const AnalyticsScreen = () => {
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const [activeTab, setActiveTab]     = useState<TabId>('streams');
    const [activePeriod, setActivePeriod] = useState<PeriodId>('week');

    const periodDays = PERIODS.find((p) => p.id === activePeriod)?.days ?? 7;
    const { chartData, stats, loading } = useStreamAnalytics(periodDays);

    const tabLabel = TABS.find((t) => t.id === activeTab)?.label ?? 'Streams';
    const isPositive = stats.percentageChange >= 0;

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader />

            {/* Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.tabScroll}
                contentContainerStyle={s.tabScrollContent}
            >
                {TABS.map((tab) => (
                    <Pressable
                        key={tab.id}
                        style={[s.tab, activeTab === tab.id && s.tabActive]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Section title */}
                <View style={s.titleRow}>
                    <Text style={s.sectionTitle}>{tabLabel}</Text>
                </View>

                {/* Period Pills */}
                <View style={s.periodRow}>
                    {PERIODS.map((p) => (
                        <Pressable
                            key={p.id}
                            style={[s.periodPill, activePeriod === p.id && s.periodPillActive]}
                            onPress={() => setActivePeriod(p.id)}
                        >
                            <Text style={[s.periodPillText, activePeriod === p.id && s.periodPillTextActive]}>
                                {p.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Stats Card */}
                <View style={s.statsCard}>
                    {loading ? (
                        <View style={{ padding: 24, alignItems: 'center' }}>
                            <ActivityIndicator color={colors.primaryGlow} size="large" />
                        </View>
                    ) : (
                        <>
                            <Text style={s.statsLabel}>{tabLabel}</Text>
                            <Text style={s.statsTotal}>{stats.currentTotal.toLocaleString()}</Text>
                            <Text style={s.statsDateRange}>{stats.currentDateRange}</Text>

                            <View style={s.statsChangeRow}>
                                <View style={[
                                    s.changeBadge,
                                    { backgroundColor: isPositive ? `${colors.success}18` : `${colors.destructive}18` },
                                ]}>
                                    {isPositive
                                        ? <TrendingUp size={12} color={colors.success} />
                                        : <TrendingDown size={12} color={colors.destructive} />
                                    }
                                    <Text style={[s.changeBadgeText, { color: isPositive ? colors.success : colors.destructive }]}>
                                        {isPositive ? '+' : ''}{stats.percentageChange}%
                                    </Text>
                                </View>
                                {stats.currentTotal === 0 && (
                                    <Text style={s.statsNoData}>No streams in this period</Text>
                                )}
                            </View>
                        </>
                    )}
                </View>

                {/* Chart Card */}
                {!loading && (
                    <View style={s.chartCard}>
                        <Text style={s.chartTitle}>Daily {tabLabel}</Text>
                        <BarChart
                            data={chartData.map((d) => ({ label: d.label, streams: d.streams, date: d.date }))}
                            accentColor={colors.primaryGlow}
                            colors={colors}
                        />
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
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 8 },

        // Horizontal tabs
        tabScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
        tabScrollContent: { paddingHorizontal: 16, gap: 4 },
        tab: {
            paddingHorizontal: 16, paddingVertical: 10,
            borderBottomWidth: 2, borderBottomColor: 'transparent',
        },
        tabActive: { borderBottomColor: colors.primaryGlow },
        tabText: { fontSize: 13, fontWeight: '600', color: colors.mutedForeground },
        tabTextActive: { color: colors.primaryGlow },

        titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        sectionTitle: { fontSize: 24, fontWeight: '800', color: colors.foreground },

        // Period pills
        periodRow: { flexDirection: 'row', gap: 8 },
        periodPill: {
            paddingHorizontal: 16, paddingVertical: 7,
            borderRadius: 20, borderWidth: 1, borderColor: colors.border,
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        },
        periodPillActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryGlow },
        periodPillText: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
        periodPillTextActive: { color: '#fff' },

        // Stats card
        statsCard: {
            borderRadius: 20, padding: 20,
            backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: 6,
        },
        statsLabel:     { fontSize: 13, color: colors.mutedForeground },
        statsTotal:     { fontSize: 40, fontWeight: '800', color: colors.primaryGlow, letterSpacing: -1 },
        statsDateRange: { fontSize: 12, color: colors.mutedForeground },
        statsChangeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
        changeBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
        changeBadgeText:{ fontSize: 13, fontWeight: '700' },
        statsNoData:    { fontSize: 12, color: colors.mutedForeground },

        // Chart card
        chartCard: {
            borderRadius: 20, padding: 20,
            backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
        },
        chartTitle: { fontSize: 13, fontWeight: '600', color: colors.mutedForeground, marginBottom: 16 },
    });
