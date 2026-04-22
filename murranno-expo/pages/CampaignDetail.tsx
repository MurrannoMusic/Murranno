import React, { useMemo, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, DollarSign, Users, TrendingUp } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';

const STATUS_COLOR: Record<string, string> = {
    Active:    '#22c55e',
    Draft:     '#6b7280',
    Paused:    '#f59e0b',
    Completed: '#9333ea',
    Rejected:  '#ef4444',
    Cancelled: '#ef4444',
};

const InfoRow = ({ label, value, colors }: { label: string; value: string | null | undefined; colors: any }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, maxWidth: '55%', textAlign: 'right' }}>
            {value || '—'}
        </Text>
    </View>
);

export const CampaignDetailPage = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { campaigns, loading } = useCampaigns();
    const [pausing, setPausing] = useState(false);

    const campaign = campaigns.find((c) => c.id === id) ?? null;

    const handlePauseToggle = async () => {
        if (!campaign) return;
        const isActive = campaign.status === 'Active';
        Alert.alert(
            isActive ? 'Pause Campaign' : 'Resume Campaign',
            `Are you sure you want to ${isActive ? 'pause' : 'resume'} this campaign?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: isActive ? 'Pause' : 'Resume',
                    style: isActive ? 'destructive' : 'default',
                    onPress: async () => {
                        setPausing(true);
                        const { error } = await supabase.functions.invoke('pause-campaign', {
                            body: { campaignId: id, currentStatus: campaign.status },
                        });
                        setPausing(false);
                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            router.back();
                        }
                    },
                },
            ],
        );
    };

    if (loading) {
        return (
            <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={colors.primaryGlow} size="large" />
            </View>
        );
    }

    if (!campaign) {
        return (
            <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.mutedForeground }}>Campaign not found.</Text>
                <Pressable style={{ marginTop: 16, padding: 12 }} onPress={() => router.back()}>
                    <Text style={{ color: colors.primaryGlow, fontWeight: '700' }}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    const statusColor = STATUS_COLOR[campaign.status] ?? '#6b7280';
    const canPauseOrResume = campaign.status === 'Active' || campaign.status === 'Paused';

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <View style={s.header}>
                <Pressable style={s.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={22} color={colors.foreground} />
                </Pressable>
                <Text style={s.headerTitle} numberOfLines={1}>Campaign Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Title block */}
                <View style={[s.titleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, gap: 4 }}>
                            <Text style={[s.campaignName, { color: colors.foreground }]}>{campaign.name}</Text>
                            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{campaign.artist}</Text>
                        </View>
                        <View style={[s.statusBadge, { backgroundColor: statusColor }]}>
                            <Text style={s.statusText}>{campaign.status}</Text>
                        </View>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>{campaign.type}</Text>
                </View>

                {/* Metrics */}
                <View style={s.metricsGrid}>
                    {([
                        { icon: <DollarSign size={18} color='#f59e0b' />, label: 'Budget',     value: `₦${campaign.budget}` },
                        { icon: <DollarSign size={18} color='#ef4444' />, label: 'Spent',      value: `₦${campaign.spent}` },
                        { icon: <Users size={18} color='#9333ea' />,      label: 'Reach',      value: campaign.reach },
                        { icon: <TrendingUp size={18} color='#22c55e' />, label: 'Engagement', value: campaign.engagement },
                    ] as const).map(({ icon, label, value }) => (
                        <View key={label} style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {icon}
                            <Text style={[s.metricValue, { color: colors.foreground }]}>{value}</Text>
                            <Text style={[s.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* Details */}
                <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[s.sectionTitle, { color: colors.foreground }]}>Campaign Info</Text>
                    <InfoRow label="Start Date"     value={campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : null} colors={colors} />
                    <InfoRow label="End Date"       value={campaign.endDate   ? new Date(campaign.endDate).toLocaleDateString()   : null} colors={colors} />
                    <InfoRow label="Platform"       value={campaign.platform}        colors={colors} />
                    <InfoRow label="Payment Status" value={campaign.paymentStatus}   colors={colors} />
                    {campaign.campaignBrief && (
                        <View style={{ paddingVertical: 10 }}>
                            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginBottom: 4 }}>Brief</Text>
                            <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 18 }}>{campaign.campaignBrief}</Text>
                        </View>
                    )}
                </View>

                {/* Target Audience */}
                {campaign.targetAudience && (
                    <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Target Audience</Text>
                        <InfoRow label="Age Range"  value={campaign.targetAudience.ageRange}               colors={colors} />
                        <InfoRow label="Locations"  value={campaign.targetAudience.locations?.join(', ')}  colors={colors} />
                        <InfoRow label="Genres"     value={campaign.targetAudience.genres?.join(', ')}     colors={colors} />
                        <InfoRow label="Interests"  value={campaign.targetAudience.interests?.join(', ')}  colors={colors} />
                    </View>
                )}

                {/* Rejection reason */}
                {campaign.rejectionReason && (
                    <View style={[s.section, { backgroundColor: '#ef444418', borderColor: '#ef4444' }]}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#ef4444', marginBottom: 6 }}>Rejection Reason</Text>
                        <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 18 }}>{campaign.rejectionReason}</Text>
                    </View>
                )}

                {/* Pause/Resume action */}
                {canPauseOrResume && (
                    <Pressable
                        style={[s.actionBtn, {
                            backgroundColor: campaign.status === 'Active' ? '#f59e0b18' : '#22c55e18',
                            borderColor:     campaign.status === 'Active' ? '#f59e0b'   : '#22c55e',
                        }]}
                        onPress={handlePauseToggle}
                        disabled={pausing}
                    >
                        {pausing
                            ? <ActivityIndicator color={campaign.status === 'Active' ? '#f59e0b' : '#22c55e'} />
                            : <Text style={{ fontSize: 14, fontWeight: '700', color: campaign.status === 'Active' ? '#f59e0b' : '#22c55e' }}>
                                {campaign.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
                              </Text>
                        }
                    </Pressable>
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
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 8 },

        header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, flex: 1, textAlign: 'center' },
        backBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

        titleCard:    { borderRadius: 16, borderWidth: 1, padding: 16 },
        campaignName: { fontSize: 18, fontWeight: '800' },
        statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
        statusText:   { fontSize: 10, fontWeight: '700', color: '#fff' },

        metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        metricCard:  { width: '47.5%', borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'flex-start', gap: 4 },
        metricValue: { fontSize: 18, fontWeight: '800' },
        metricLabel: { fontSize: 11 },

        section:      { borderRadius: 16, borderWidth: 1, padding: 16 },
        sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },

        actionBtn: { borderRadius: 14, borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
    });
