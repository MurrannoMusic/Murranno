import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable,
} from 'react-native';
import { ChevronRight, ChevronDown, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';

// ─── data ─────────────────────────────────────────────────────────────────────

const FAQS = [
    {
        q: 'How do I distribute my music?',
        a: 'Upload your release through the Upload tab. Choose your distribution platforms, set a release date, and submit. Your music will be delivered within 3–5 business days.',
    },
    {
        q: 'What are the payment terms?',
        a: 'Royalties are calculated monthly and paid out within 30 days after the reporting period ends. Minimum payout threshold is ₦5,000.',
    },
    {
        q: 'How long does distribution take?',
        a: 'Standard distribution takes 3–5 business days. Apple Music and Spotify may take up to 7 days for new releases.',
    },
    {
        q: 'Can I edit my release after submission?',
        a: 'Minor metadata edits (title, description) are possible before your release goes live. Track audio and cover art changes require re-submission.',
    },
    {
        q: 'What file formats are supported?',
        a: 'We accept WAV (recommended), FLAC, and high-quality MP3 (320kbps). Cover art must be 3000×3000px JPEG or PNG.',
    },
    {
        q: 'How do promotion campaigns work?',
        a: 'Campaigns boost your music on streaming platforms via playlist pitching and social media promotion. Results are tracked in your Analytics dashboard.',
    },
    {
        q: 'What happens to my rights?',
        a: 'You retain 100% ownership of your music. Murranno acts as a non-exclusive distributor and never claims ownership of your content.',
    },
    {
        q: 'How do I withdraw my earnings?',
        a: 'Go to the Earnings tab, add a bank account under Payout Methods, then tap Withdraw Funds. Withdrawals are processed within 1–3 business days.',
    },
    {
        q: 'Can labels manage multiple artists?',
        a: 'Yes. Label accounts can manage multiple artist profiles under one login. Contact support to upgrade to a label account.',
    },
    {
        q: 'What analytics are provided?',
        a: 'Murranno provides streams, listener counts, platform breakdowns, geographic data, and playlist placements updated daily.',
    },
];

// ─── component ────────────────────────────────────────────────────────────────

export const FAQ = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Back */}
                <Pressable style={s.back} onPress={() => router.back()}>
                    <ChevronRight size={16} color={colors.foreground} style={{ transform: [{ rotate: '180deg' }] }} />
                    <Text style={s.backText}>Back</Text>
                </Pressable>

                <Text style={s.title}>Frequently Asked Questions</Text>
                <Text style={s.subtitle}>Find answers to common questions about using Murranno Music</Text>

                {/* Accordion */}
                <View style={s.accordionWrap}>
                    {FAQS.map((item, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <View key={i} style={[s.item, i < FAQS.length - 1 && s.itemBorder]}>
                                <Pressable style={s.itemHeader} onPress={() => toggle(i)}>
                                    <Text style={s.question}>{item.q}</Text>
                                    {isOpen
                                        ? <ChevronDown size={16} color={colors.mutedForeground} />
                                        : <ChevronRight size={16} color={colors.mutedForeground} />
                                    }
                                </Pressable>
                                {isOpen && (
                                    <Text style={s.answer}>{item.a}</Text>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* CTA */}
                <View style={s.ctaCard}>
                    <Text style={s.ctaTitle}>Still have questions?</Text>
                    <Text style={s.ctaSub}>Can't find what you're looking for? Our support team is here to help.</Text>
                    <Pressable
                        style={s.ctaBtn}
                        onPress={() => router.push('/app/support' as any)}
                    >
                        <MessageCircle size={15} color="#fff" />
                        <Text style={s.ctaBtnText}>Contact Support</Text>
                    </Pressable>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ─── styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
    return StyleSheet.create({
        screen:       { flex: 1, backgroundColor: colors.background },
        scroll:       { flex: 1 },
        scrollContent:{ paddingHorizontal: 16, paddingTop: 8, gap: 16 },

        back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
        backText: { fontSize: 14, color: colors.foreground, fontWeight: '500' },

        title:    { fontSize: 24, fontWeight: '800', color: colors.foreground },
        subtitle: { fontSize: 14, color: colors.mutedForeground, lineHeight: 22, marginTop: -8 },

        accordionWrap: {
            backgroundColor: colors.card, borderRadius: 16,
            borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
        },
        item:       { paddingHorizontal: 16 },
        itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
        itemHeader: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingVertical: 16, gap: 12,
        },
        question: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.foreground, lineHeight: 20 },
        answer:   { fontSize: 13, color: colors.mutedForeground, lineHeight: 20, paddingBottom: 14 },

        ctaCard: {
            backgroundColor: colors.card, borderRadius: 16,
            borderWidth: 1, borderColor: colors.border,
            padding: 20, alignItems: 'center', gap: 8,
        },
        ctaTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground },
        ctaSub:   { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
        ctaBtn: {
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: colors.primaryGlow, borderRadius: 12,
            paddingVertical: 12, paddingHorizontal: 24, marginTop: 4,
        },
        ctaBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
    });
}
