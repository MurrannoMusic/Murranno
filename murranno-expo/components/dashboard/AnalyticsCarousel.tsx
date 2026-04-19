import React, { useRef, useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    Dimensions, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { TrendingUp, Store, Trophy, Globe } from 'lucide-react-native';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useTheme } from '@/hooks/useTheme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 32;

interface Slide {
    key: string;
    title: string;
    value: string;
    subtext: string;
    Icon: React.ComponentType<any>;
    accentColor: string;
    bgColor: string;
}

export const AnalyticsCarousel = () => {
    const { data, loading } = useAnalyticsData(7);
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const [activeIdx, setActiveIdx] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
        setActiveIdx(idx);
    };

    if (loading) {
        return (
            <View style={s.skeletonCard}>
                <View style={s.skeletonIcon} />
                <View style={[s.skeletonLine, { width: '40%' }]} />
                <View style={[s.skeletonLine, { width: '65%', height: 28, marginTop: 6 }]} />
                <View style={[s.skeletonLine, { width: '80%', marginTop: 6 }]} />
            </View>
        );
    }

    if (!data) return null;

    const slides: Slide[] = [
        {
            key: 'streams',
            title: 'Streams This Week',
            value: data.totalStreams.toLocaleString(),
            subtext: `Across all stores • ${data.dateRange}`,
            Icon: TrendingUp,
            accentColor: '#a855f7',
            bgColor: 'rgba(168,85,247,0.12)',
        },
        ...(data.mostStreamedTrack ? [{
            key: 'track',
            title: 'Most Streamed Track',
            value: data.mostStreamedTrack.title,
            subtext: `${data.mostStreamedTrack.release} – ${data.mostStreamedTrack.streams.toLocaleString()} Streams`,
            Icon: Trophy,
            accentColor: '#e879f9',
            bgColor: 'rgba(232,121,249,0.12)',
        }] : []),
        ...(data.bestPlatform ? [{
            key: 'platform',
            title: 'Best Store',
            value: data.bestPlatform.name,
            subtext: `${data.bestPlatform.streams.toLocaleString()} Streams`,
            Icon: Store,
            accentColor: '#1db954',
            bgColor: 'rgba(29,185,84,0.12)',
        }] : []),
        ...(data.topCountry ? [{
            key: 'country',
            title: 'Top Country',
            value: data.topCountry.name,
            subtext: `${data.topCountry.streams.toLocaleString()} Streams`,
            Icon: Globe,
            accentColor: '#38bdf8',
            bgColor: 'rgba(56,189,248,0.12)',
        }] : []),
    ];

    if (slides.length === 0) return null;

    return (
        <View>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                decelerationRate="fast"
                snapToInterval={CARD_W}
                snapToAlignment="start"
            >
                {slides.map((slide) => (
                    <View key={slide.key} style={[s.card, { width: CARD_W }]}>
                        <View style={[s.iconWrap, { backgroundColor: slide.bgColor }]}>
                            <slide.Icon size={20} color={slide.accentColor} />
                        </View>
                        <Text style={s.cardTitle}>{slide.title}</Text>
                        <Text style={[s.cardValue, { color: slide.accentColor }]} numberOfLines={1}>
                            {slide.value}
                        </Text>
                        <Text style={s.cardSubtext}>{slide.subtext}</Text>
                    </View>
                ))}
            </ScrollView>

            {slides.length > 1 && (
                <View style={s.dots}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={[s.dot, i === activeIdx ? s.dotActive : s.dotInactive]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
    const cardBg     = isDark ? 'rgba(255,255,255,0.04)' : colors.card;
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : colors.border;
    const skelBg     = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

    return StyleSheet.create({
        card: {
            backgroundColor: cardBg, borderRadius: 20,
            padding: 20, borderWidth: 1, borderColor: cardBorder,
        },
        iconWrap: {
            width: 44, height: 44, borderRadius: 14,
            justifyContent: 'center', alignItems: 'center', marginBottom: 14,
        },
        cardTitle: {
            fontSize: 11, fontWeight: '600', color: colors.mutedForeground,
            textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
        },
        cardValue:   { fontSize: 28, fontWeight: 'bold', marginBottom: 6, letterSpacing: -0.5 },
        cardSubtext: { fontSize: 12, color: colors.mutedForeground },

        dots:        { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
        dot:         { height: 4, borderRadius: 2 },
        dotActive:   { width: 20, backgroundColor: '#a855f7' },
        dotInactive: { width: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },

        skeletonCard: {
            backgroundColor: cardBg, borderRadius: 20,
            padding: 20, borderWidth: 1, borderColor: cardBorder,
        },
        skeletonIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: skelBg, marginBottom: 14 },
        skeletonLine: { height: 14, borderRadius: 7, backgroundColor: skelBg, marginTop: 8 },
    });
}
