import React from 'react';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states/StateViews';
import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable } from 'react-native';
import { Music2 } from 'lucide-react-native';
import { useTopTracks } from '@/hooks/useTopTracks';
import { useTheme } from '@/hooks/useTheme';
export const TopTracksCard = ({ period = 30 }: { period?: number }) => {
    const { tracks, loading, error, refetch } = useTopTracks(period);
    const { colors } = useTheme();
    return <View>
        <View style={s.heading}><Text style={{ fontSize: 21, fontWeight: '600', color: colors.foreground }}>Top tracks</Text><Text style={{ fontSize: 12, color: colors.mutedForeground }}>Streams</Text></View>
        {loading ? <ListSkeleton rows={5} /> : error ? <ErrorState error={error} title="Couldn’t load top tracks" onRetry={refetch} /> : tracks.length === 0 ? <EmptyState icon={Music2} title="No streams reported yet" body="Your most streamed tracks show up here once stores send their first reports." /> : tracks.map((track, i) => <View key={track.id} style={[s.row, { borderBottomColor: colors.border }]}>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, width: 20 }}>{String(i + 1).padStart(2, '0')}</Text>
            {track.coverArtUrl ? <Image source={{ uri: track.coverArtUrl }} style={s.art} /> : <View style={[s.art, { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }]}><Music2 size={18} color={colors.mutedForeground} /></View>}
            <View style={{ flex: 1, gap: 5 }}><Text numberOfLines={1} style={{ color: colors.foreground, fontSize: 15, fontWeight: '500' }}>{track.name}</Text>{!!track.release && <Text numberOfLines={1} style={{ color: colors.mutedForeground, fontSize: 12 }}>{track.release}</Text>}</View>
            <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{track.plays}</Text>
        </View>)}
    </View>;
};
const s = StyleSheet.create({ heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth }, art: { width: 44, height: 44, borderRadius: 5 } });
