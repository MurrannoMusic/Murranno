import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';

const SECTIONS = [
    {
        title: '1. Information We Collect',
        body: 'We collect information you provide directly to us, including your name, email address, payment information, and music content you upload. We also collect information about how you use our services.',
    },
    {
        title: '2. How We Use Your Information',
        body: 'We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and events.',
    },
    {
        title: '3. Information Sharing',
        body: 'We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, and customer service.',
    },
    {
        title: '4. Data Security',
        body: 'We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorised access, disclosure, alteration, and destruction.',
    },
    {
        title: '5. Cookies and Tracking',
        body: 'We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.',
    },
    {
        title: '6. Your Rights',
        body: 'You have the right to access, update, or delete your personal information at any time. You can exercise these rights by contacting us through the support section of our app.',
    },
    {
        title: '7. Children\'s Privacy',
        body: 'Our service does not address anyone under the age of 13. We do not knowingly collect personal information from children under 13.',
    },
    {
        title: '8. Changes to This Policy',
        body: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date.',
    },
    {
        title: '9. Contact Information',
        body: 'If you have any questions about this privacy policy, please contact us at privacy@murrannomusic.com.',
    },
];

export const PrivacyPolicy = () => {
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

                <Text style={s.title}>Privacy Policy</Text>
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
