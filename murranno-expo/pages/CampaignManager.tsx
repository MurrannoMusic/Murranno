import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Target, TrendingUp, DollarSign, Users, ChevronRight } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { useCampaigns } from '@/hooks/useCampaigns';

type FilterTab = 'all' | 'Active' | 'Draft' | 'Paused' | 'Completed';

const FILTERS: FilterTab[] = ['all', 'Active', 'Draft', 'Paused', 'Completed'];

const STATUS_COLOR: Record<string, string> = {
    Active:    '#22c55e',
    Draft:     '#6b7280',
    Paused:    '#f59e0b',
    Completed: '#9333ea',
    Rejected:  '#ef4444',
    Cancelled: '#ef4444',
};

export const CampaignManagerPage = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { campaigns, stats, loading } = useCampaigns();
    const [filter, setFilter] = useState<FilterTab>('all');

    const filtered = filter === 'all'
        ? campaigns
        : campaigns.filter((c) => c.status === filter);

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Stats */}
                <View style={s.statsGrid}>
                    {([
                        { icon: <Target size={18} color={colors.primaryGlow} />,  label: 'Total',  value: stats.totalCampaigns.toString() },
                        { icon: <TrendingUp size={18} color='#22c55e' />,          label: 'Active', value: stats.activeCampaigns.toString() },
                        { icon: <DollarSign size={18} color='#f59e0b' />,          label: 'Spent',  value: `₦${stats.totalSpent}` },
                        { icon: <Users size={18} color='#9333ea' />,               label: 'Reach',  value: stats.totalReach },
                    ] as const).map(({ icon, label, value }) => (
                        <View key={label} style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {icon}
                            <Text style={[s.statValue, { color: colors.foreground }]}>{value}</Text>
                            <Text style={[s.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* Filter tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
                    {FILTERS.map((f) => {
                        const isActive = filter === f;
                        return (
                            <Pressable
                                key={f}
                                style={[s.filterChip, isActive && { backgroundColor: colors.primaryGlow, borderColor: colors.primaryGlow }]}
                                onPress={() => setFilter(f)}
                            >
                                <Text style={[s.filterChipText, { color: isActive ? '#fff' : colors.foreground }]}>
                                    {f === 'all' ? 'All' : f}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <Text style={[s.sectionTitle, { color: colors.foreground }]}>
                    {filter === 'all' ? 'All Campaigns' : `${filter} Campaigns`}
                </Text>

                {loading ? (
                    <View style={s.centred}>
                        <ActivityIndicator color={colors.primaryGlow} size="large" />
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={s.centred}>
                        <Text style={[s.emptyText, { color: colors.mutedForeground }]}>No campaigns found</Text>
                    </View>
                ) : (
                    filtered.map((campaign) => {
                        const statusColor = STATUS_COLOR[campaign.status] ?? '#6b7280';
                        return (
                            <Pressable
                                key={campaign.id}
                                style={[s.campaignCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => router.push(`/app/campaigns/${campaign.id}` as any)}
                            >
                                <View style={s.campaignTop}>
                                    <View style={{ flex: 1, gap: 2 }}>
                                        <Text style={[s.campaignName, { color: colors.foreground }]} numberOfLines={1}>{campaign.name}</Text>
                                        <Text style={[s.campaignArtist, { color: colors.mutedForeground }]}>{campaign.artist}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                        <View style={[s.statusBadge, { backgroundColor: statusColor }]}>
                                            <Text style={s.statusText}>{campaign.status}</Text>
                                        </View>
                                        <ChevronRight size={16} color={colors.mutedForeground} />
                                    </View>
                                </View>
                                <View style={[s.campaignMeta, { borderTopColor: colors.border }]}>
                                    <Text style={[s.metaItem, { color: colors.mutedForeground }]}>{campaign.type}</Text>
                                    <Text style={[s.metaItem, { color: colors.mutedForeground }]}>Budget: ₦{campaign.budget}</Text>
                                    <Text style={[s.metaItem, { color: colors.mutedForeground }]}>Reach: {campaign.reach}</Text>
                                </View>
                            </Pressable>
                        );
                    })
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen:        { flex: 1, backgroundColor: colors.background },
        scroll:        { flex: 1 },
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 4 },

        statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        statCard:  { width: '47.5%', borderRadius: 16, borderWidth: 1, padding: 14, gap: 4, alignItems: 'flex-start' },
        statValue: { fontSize: 20, fontWeight: '800' },
        statLabel: { fontSize: 11, marginTop: -2 },

        filterScroll: { flexGrow: 0 },
        filterChip: {
            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
            borderWidth: 1, borderColor: colors.border, marginRight: 6,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        },
        filterChipText: { fontSize: 12, fontWeight: '600' },

        sectionTitle: { fontSize: 18, fontWeight: '800' },
        centred:      { paddingVertical: 48, alignItems: 'center' },
        emptyText:    { fontSize: 13 },

        campaignCard:   { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
        campaignTop:    { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
        campaignName:   { fontSize: 14, fontWeight: '700' },
        campaignArtist: { fontSize: 12 },
        statusBadge:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
        statusText:     { fontSize: 10, fontWeight: '700', color: '#fff' },
        campaignMeta:   { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
        metaItem:       { fontSize: 11 },
    });
