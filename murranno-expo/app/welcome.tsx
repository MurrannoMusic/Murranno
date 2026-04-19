import React, { useRef, useState } from 'react';
import {
    View, Text, StyleSheet, Pressable, Image,
    Dimensions, FlatList, ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

const { width: W, height: H } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        image: require('../assets/images/onboarding-1.jpg'),
        title: 'Distribute Your Music Globally',
        subtitle: 'Upload once and reach all major streaming platforms including Spotify, Apple Music, Boomplay, and more.',
    },
    {
        id: '2',
        image: require('../assets/images/onboarding-2.jpg'),
        title: 'Promote & Grow Your Fanbase',
        subtitle: 'Run targeted campaigns, playlist pitching, and influencer partnerships to amplify your reach.',
    },
    {
        id: '3',
        image: require('../assets/images/onboarding-3.jpg'),
        title: 'Track Royalties & Get Paid Fast',
        subtitle: 'Real-time analytics, transparent earnings, and fast payouts to your bank or mobile money wallet.',
    },
];

export default function Welcome() {
    const router  = useRouter();
    const listRef = useRef<FlatList>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems[0]?.index != null) {
                setActiveIndex(viewableItems[0].index);
            }
        },
    ).current;

    const handleNext = () => {
        if (activeIndex < SLIDES.length - 1) {
            listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
        }
    };

    return (
        <View style={s.screen}>
            {/* Full-screen pager */}
            <FlatList
                ref={listRef}
                data={SLIDES}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                renderItem={({ item }) => (
                    <View style={s.slide}>
                        <Image source={item.image} style={s.bg} resizeMode="cover" />
                        {/* gradient overlay */}
                        <View style={s.gradient} />
                    </View>
                )}
            />

            {/* Bottom sheet */}
            <View style={s.sheet}>
                {/* Slide copy */}
                <Text style={s.title}>{SLIDES[activeIndex].title}</Text>
                <Text style={s.subtitle}>{SLIDES[activeIndex].subtitle}</Text>

                {/* Dots + Next */}
                <View style={s.dotsRow}>
                    <View style={s.dots}>
                        {SLIDES.map((_, i) => (
                            <View key={i} style={[s.dot, i === activeIndex && s.dotActive]} />
                        ))}
                    </View>
                    {activeIndex < SLIDES.length - 1 && (
                        <Pressable style={s.nextBtn} onPress={handleNext}>
                            <Text style={s.nextText}>Next</Text>
                            <ChevronRight size={15} color="#fff" />
                        </Pressable>
                    )}
                </View>

                {/* CTA */}
                <Pressable style={s.getStartedBtn} onPress={() => router.push('/sign-up' as any)}>
                    <Text style={s.getStartedText}>Get Started</Text>
                </Pressable>

                <Pressable style={s.loginRow} onPress={() => router.push('/sign-in' as any)}>
                    <Text style={s.loginText}>Already have an account? </Text>
                    <Text style={s.loginLink}>Log in</Text>
                </Pressable>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#060c1f' },

    slide: { width: W, height: H },
    bg:    { position: 'absolute', width: W, height: H },
    gradient: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: H * 0.55,
        backgroundColor: 'transparent',
        // manual dark fade — no expo-linear-gradient needed
        backgroundImage: undefined,
    },

    sheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(6,12,31,0.88)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48,
        gap: 14,
    },

    title:    { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 22 },

    dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    dots:    { flexDirection: 'row', gap: 7, alignItems: 'center' },
    dot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
    dotActive:{ width: 22, backgroundColor: '#9333ea' },

    nextBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
    nextText: { fontSize: 14, fontWeight: '600', color: '#fff' },

    getStartedBtn: {
        backgroundColor: '#7c3aed',
        borderRadius: 16, paddingVertical: 16,
        alignItems: 'center', marginTop: 4,
        shadowColor: '#7c3aed', shadowOpacity: 0.4, shadowRadius: 16, elevation: 6,
    },
    getStartedText: { fontSize: 16, fontWeight: '700', color: '#fff' },

    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
    loginText:{ fontSize: 14, color: 'rgba(255,255,255,0.5)' },
    loginLink:{ fontSize: 14, fontWeight: '700', color: '#9333ea' },
});
