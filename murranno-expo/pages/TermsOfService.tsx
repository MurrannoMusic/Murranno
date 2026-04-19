import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';

const SECTIONS = [
    {
        title: '1. Acceptance of Terms',
        body: 'By accessing or using Murranno Music\'s services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.',
    },
    {
        title: '2. Account Responsibilities',
        body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorised use.',
    },
    {
        title: '3. Music Distribution',
        body: 'By uploading music through our platform, you grant Murranno a non-exclusive, worldwide licence to distribute your content to streaming platforms. You retain full ownership of all rights to your content.',
    },
    {
        title: '4. Payments and Royalties',
        body: 'Royalties are calculated based on streams and sales reported by distribution partners. Payments are processed monthly with a minimum payout threshold of ₦5,000. Murranno charges a platform fee as disclosed at sign-up.',
    },
    {
        title: '5. Prohibited Content',
        body: 'You may not upload content that infringes on third-party intellectual property rights, contains harmful or illegal material, or violates any applicable laws or regulations.',
    },
    {
        title: '6. Termination',
        body: 'We may suspend or terminate your account at our discretion if you violate these terms. You may terminate your account at any time by contacting support. Termination does not affect royalties already earned.',
    },
    {
        title: '7. Limitation of Liability',
        body: 'Murranno shall not be liable for indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim.',
    },
    {
        title: '8. Changes to Terms',
        body: 'We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms. We will notify you of material changes by email.',
    },
    {
        title: '9. Governing Law',
        body: 'These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved through arbitration in Lagos, Nigeria.',
    },
    {
        title: '10. Intellectual Property',
        body: 'The Murranno platform, including its design, software, and branding, is protected by copyright and other intellectual property laws. You may not reproduce or distribute any part of our platform without permission.',
    },
    {
        title: '11. Contact Information',
        body: 'For questions about these Terms of Service, please contact us at legal@murrannomusic.com.',
    },
];

export const TermsOfService = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                <Pressable style={s.back} onPress={() => router.back()}>
                    <ChevronRight size={16} color={colors.foreground} style={{ transform: [{ rotate: '180deg' }] }} />
                    <Text style={s.backText}>Back</Text>
                </Pressable>

                <Text style={s.title}>Terms of Service</Text>
                <Text style={s.meta}>Effective date: January 1, 2025</Text>

                {SECTIONS.map(({ title, body }) => (
                    <View key={title} style={s.section}>
                        <Text style={s.sectionTitle}>{title}</Text>
                        <Text style={s.sectionBody}>{body}</Text>
                    </View>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
    return StyleSheet.create({
        screen:       { flex: 1, backgroundColor: colors.background },
        scroll:       { flex: 1 },
        scrollContent:{ paddingHorizontal: 16, paddingTop: 8, gap: 4 },

        back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, marginBottom: 4 },
        backText: { fontSize: 14, color: colors.foreground, fontWeight: '500' },

        title: { fontSize: 26, fontWeight: '800', color: colors.foreground, marginBottom: 4 },
        meta:  { fontSize: 12, color: colors.mutedForeground, marginBottom: 16 },

        section:      { marginBottom: 20 },
        sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 6 },
        sectionBody:  { fontSize: 14, color: colors.mutedForeground, lineHeight: 22 },
    });
}
