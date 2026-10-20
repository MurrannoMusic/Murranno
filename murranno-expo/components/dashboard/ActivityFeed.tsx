import React, { useMemo } from 'react';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states/StateViews';
import { View, Text, StyleSheet } from 'react-native';
import { Upload, DollarSign, Play, Info } from 'lucide-react-native';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useTheme } from '@/hooks/useTheme';

const ICON_MAP = {
    upload: Upload,
    dollar: DollarSign,
    play:   Play,
    info:   Info,
};

export const ActivityFeed = () => {
    const { activities, loading, error, refetch } = useRecentActivity();
    const { colors } = useTheme();
    const s = useMemo(() => makeStyles(colors), [colors]);

    return (
        <View>
            <Text style={s.sectionLabel}>Recent activity</Text>

            {loading && !activities.length ? (
                <ListSkeleton rows={3} />
            ) : error && !activities.length ? (
                <ErrorState error={error} title="Couldn’t load recent activity" onRetry={refetch} />
            ) : activities.length === 0 ? (
                <EmptyState icon={Info} title="No activity yet" body="Uploads, payouts and new stream reports will show up here." />
            ) : (
                <View style={s.list}>
                    {activities.map((item) => {
                        const IconComp   = ICON_MAP[item.icon] ?? Info;
                        const accentColor = colors.mutedForeground;
                        return (
                            <View key={item.id} style={s.row}>
                                <View style={[s.iconWrap, { backgroundColor: colors.background }]}>
                                    <IconComp size={15} color={accentColor} />
                                </View>
                                <View style={s.content}>
                                    <Text style={s.title} numberOfLines={1}>{item.title}</Text>
                                    <Text style={s.time}>{item.time}</Text>
                                </View>
                                <View style={[s.dot, { backgroundColor: accentColor }]} />
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
    const skelBg = colors.secondary;

    return StyleSheet.create({
        sectionLabel: {
            fontSize: 21, fontWeight: '600', color: colors.foreground, marginBottom: 12,
        },
        list: { gap: 8 },
        row: {
            flexDirection: 'row', alignItems: 'center', gap: 12,
            paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        iconWrap: {
            width: 36, height: 36, borderRadius: 18,
            justifyContent: 'center', alignItems: 'center',
        },
        content: { flex: 1, gap: 2 },
        title:   { fontSize: 13, fontWeight: '600', color: colors.foreground },
        time:    { fontSize: 11, color: colors.mutedForeground },
        dot:     { width: 6, height: 6, borderRadius: 3 },
        emptyBox: {
            paddingVertical: 24,
        },
        emptyText:   { fontSize: 13, color: colors.mutedForeground, textAlign: 'left' },
        skeletonLine:{ height: 12, borderRadius: 6, backgroundColor: skelBg },
    });
}
