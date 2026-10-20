import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { ChevronRight, Music2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { Release } from '@/hooks/useReleases';

export function ReleaseRow({ release }: { release: Release }) {
    const { colors } = useTheme();
    const router = useRouter();
    const status = release.status || 'Draft';
    const live = /^(live|published|approved)$/i.test(status);
    const warning = /pending|review|processing/i.test(status);
    const rejected = /reject|fail/i.test(status);
    const tint = live ? colors.success : warning ? colors.warning : rejected ? colors.destructive : colors.mutedForeground;
    const date = release.releaseDate ? new Date(release.releaseDate) : null;
    const dateLabel = date && !isNaN(date.getTime()) ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date set';
    return <Pressable accessibilityRole="button" accessibilityLabel={`${release.title}, ${status}, view release`} onPress={() => router.push(`/app/releases/${release.id}` as any)} style={({ pressed }) => [s.row, { borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
        {release.coverArtUrl ? <Image source={{ uri: release.coverArtUrl }} style={s.art} /> : <View style={[s.art, s.placeholder, { backgroundColor: colors.secondary }]}><Music2 size={22} color={colors.mutedForeground} /></View>}
        <View style={s.info}>
            <Text numberOfLines={1} style={[s.title, { color: colors.foreground }]}>{release.title}</Text>
            <Text numberOfLines={1} style={[s.meta, { color: colors.mutedForeground }]}>{release.releaseType || 'Release'} · {dateLabel}</Text>
            <Text style={[s.status, { color: tint }]}>{status}</Text>
        </View>
        <ChevronRight size={18} color={colors.mutedForeground} />
    </Pressable>;
}
const s = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth }, art: { width: 60, height: 60, borderRadius: 6 }, placeholder: { alignItems: 'center', justifyContent: 'center' }, info: { flex: 1, gap: 4 }, title: { fontSize: 16, fontWeight: '600' }, meta: { fontSize: 12 }, status: { fontSize: 12, fontWeight: '500' } });
