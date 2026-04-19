import React, { useMemo } from 'react';
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

const TYPE_COLOR: Record<string, string> = {
    release:  '#a855f7',
    campaign: '#38bdf8',
    earning:  '#10b981',
    info:     '#64748b',
};

export const ActivityFeed = () => {
    const { activities, loading } = useRecentActivity();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    return (
        <View>
            <Text style={s.sectionLabel}>Activity</Text>

            {loading ? (
                <View style={s.emptyBox}>
                    <View style={[s.skeletonLine, { width: '70%' }]} />
                    <View style={[s.skeletonLine, { width: '50%', marginTop: 8 }]} />
                </View>
            ) : activities.length === 0 ? (
                <View style={s.emptyBox}>
                    <Text style={s.emptyText}>No recent activity.</Text>
                </View>
            ) : (
                <View style={s.list}>
                    {activities.map((item) => {
                        const IconComp   = ICON_MAP[item.icon] ?? Info;
                        const accentColor = TYPE_COLOR[item.type] ?? '#64748b';
                        return (
                            <View key={item.id} style={s.row}>
                                <View style={[s.iconWrap, { backgroundColor: `${accentColor}20` }]}>
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

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
    const rowBg     = isDark ? 'rgba(255,255,255,0.04)' : colors.card;
    const rowBorder = isDark ? 'rgba(255,255,255,0.07)' : colors.border;
    const skelBg    = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

    return StyleSheet.create({
        sectionLabel: {
            fontSize: 11, fontWeight: '600', color: colors.mutedForeground,
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
        },
        list: { gap: 8 },
        row: {
            flexDirection: 'row', alignItems: 'center', gap: 12,
            padding: 12, backgroundColor: rowBg,
            borderRadius: 14, borderWidth: 1, borderColor: rowBorder,
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
            padding: 16, backgroundColor: rowBg,
            borderRadius: 14, borderWidth: 1, borderColor: rowBorder,
        },
        emptyText:   { fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },
        skeletonLine:{ height: 12, borderRadius: 6, backgroundColor: skelBg },
    });
}
