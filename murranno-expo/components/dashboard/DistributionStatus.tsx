import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Circle, AlertCircle, CheckCircle, Clock } from 'lucide-react-native';
import { useReleases } from '@/hooks/useReleases';
import { useTheme } from '@/hooks/useTheme';

const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'published' || s === 'live')
        return { color: '#10b981', bg: 'rgba(16,185,129,0.15)', Icon: CheckCircle, label: 'Live' };
    if (s === 'pending' || s === 'processing' || s === 'in review')
        return { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', Icon: Clock, label: 'In Review' };
    if (s === 'rejected' || s === 'takedown')
        return { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', Icon: AlertCircle, label: 'Action Required' };
    return { color: '#64748b', bg: 'rgba(100,116,139,0.15)', Icon: Circle, label: status || 'Draft' };
};

export const DistributionStatus = () => {
    const { releases, loading } = useReleases();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    if (loading || releases.length === 0) return null;

    const recent = releases.slice(0, 5);

    return (
        <View>
            <Text style={s.sectionLabel}>Distribution Status</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.scrollContent}
            >
                {recent.map((item) => {
                    const cfg = getStatusConfig(item.status);
                    return (
                        <View key={item.id} style={s.card}>
                            <View style={s.statusRow}>
                                <View style={[s.iconWrap, { backgroundColor: cfg.bg }]}>
                                    <cfg.Icon size={11} color={cfg.color} />
                                </View>
                                <Text style={[s.statusLabel, { color: cfg.color }]}>
                                    {cfg.label}
                                </Text>
                            </View>
                            <Text style={s.releaseTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={s.releaseType}>{item.releaseType}</Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
    return StyleSheet.create({
        sectionLabel: {
            fontSize: 11, fontWeight: '600', color: colors.mutedForeground,
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
        },
        scrollContent: { gap: 10, paddingRight: 4 },
        card: {
            width: 152, padding: 14, gap: 6,
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.card,
            borderRadius: 16, borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : colors.border,
        },
        statusRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
        iconWrap:    { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
        statusLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
        releaseTitle:{ fontSize: 13, fontWeight: '700', color: colors.foreground, marginTop: 2 },
        releaseType: { fontSize: 11, color: colors.mutedForeground },
    });
}
