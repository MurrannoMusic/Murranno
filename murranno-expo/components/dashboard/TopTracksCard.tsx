import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Music2 } from 'lucide-react-native';
import { useTopTracks } from '@/hooks/useTopTracks';
import { useTheme } from '@/hooks/useTheme';

export const TopTracksCard = () => {
    const { tracks, loading } = useTopTracks();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    if (loading) {
        return (
            <View style={s.container}>
                <Text style={s.sectionLabel}>Top Tracks</Text>
                {[1, 2, 3].map((i) => (
                    <View key={i} style={s.row}>
                        <View style={s.skeletonIcon} />
                        <View style={{ flex: 1, gap: 6 }}>
                            <View style={[s.skeletonLine, { width: '60%' }]} />
                            <View style={[s.skeletonLine, { width: '30%' }]} />
                        </View>
                        <View style={[s.skeletonLine, { width: 50 }]} />
                    </View>
                ))}
            </View>
        );
    }

    if (tracks.length === 0) return null;

    const maxPlays = tracks[0]?.rawPlays || 1;

    return (
        <View style={s.container}>
            <Text style={s.sectionLabel}>Top Tracks</Text>
            {tracks.map((track) => {
                const barWidth = `${Math.round((track.rawPlays / maxPlays) * 100)}%`;
                return (
                    <View key={track.id} style={s.row}>
                        <View style={s.iconWrap}>
                            <Music2 size={16} color={colors.primaryGlow} />
                        </View>

                        <View style={s.info}>
                            <Text style={s.trackName} numberOfLines={1}>{track.name}</Text>
                            <View style={s.barBg}>
                                <View style={[s.barFill, { width: barWidth as any }]} />
                            </View>
                            <Text style={s.playsLabel}>plays this week</Text>
                        </View>

                        <View style={s.stats}>
                            <Text style={s.playsValue}>{track.plays}</Text>
                            <Text style={s.changeValue}>{track.change}</Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
    const rowBg     = isDark ? 'rgba(255,255,255,0.04)' : colors.card;
    const rowBorder = isDark ? 'rgba(255,255,255,0.07)' : colors.border;
    const skelBg    = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

    return StyleSheet.create({
        container:    { gap: 12 },
        sectionLabel: {
            fontSize: 11, fontWeight: '600', color: colors.mutedForeground,
            textTransform: 'uppercase', letterSpacing: 0.8,
        },
        row: {
            flexDirection: 'row', alignItems: 'center', gap: 12,
            padding: 14, backgroundColor: rowBg,
            borderRadius: 16, borderWidth: 1, borderColor: rowBorder,
        },
        iconWrap: {
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: `${colors.primaryGlow}18`,
            justifyContent: 'center', alignItems: 'center',
        },
        info:      { flex: 1, gap: 4 },
        trackName: { fontSize: 13, fontWeight: '700', color: colors.foreground },
        barBg: {
            height: 3,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderRadius: 2, overflow: 'hidden',
        },
        barFill:    { height: 3, backgroundColor: colors.primaryGlow, borderRadius: 2 },
        playsLabel: { fontSize: 10, color: colors.mutedForeground },
        stats:      { alignItems: 'flex-end', gap: 2 },
        playsValue: { fontSize: 14, fontWeight: '700', color: colors.foreground },
        changeValue:{ fontSize: 11, fontWeight: '600', color: colors.success },

        skeletonIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: skelBg },
        skeletonLine: { height: 12, borderRadius: 6, backgroundColor: skelBg },
    });
}
