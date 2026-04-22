import React from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export const KYCGate = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    
    return (
        <View style={styles.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={styles.gateCard}>
                <View style={[styles.shieldWrap, { backgroundColor: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)' }]}>
                    <ShieldAlert size={36} color="#fbbf24" />
                </View>
                <Text style={[styles.gateTitle, { color: colors.foreground }]}>Verification Required</Text>
                <Text style={[styles.gateSubtitle, { color: colors.mutedForeground }]}>
                    To access this feature (Uploads & Transactions), you need to verify your identity. This is required by law for royalty payments.
                </Text>
                <Pressable
                    style={[styles.primaryBtn, { backgroundColor: colors.primaryGlow }]}
                    onPress={() => router.push('/app/kyc' as any)}
                >
                    <Text style={styles.primaryBtnText}>Complete KYC Verification</Text>
                </Pressable>
                <Pressable style={styles.ghostBtn} onPress={() => router.back()}>
                    <Text style={[styles.ghostBtnText, { color: colors.foreground }]}>Go Back</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent' },
    gateCard: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 32, gap: 16,
    },
    shieldWrap: {
        width: 72, height: 72, borderRadius: 36,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1,
    },
    gateTitle:    { fontSize: 22, fontWeight: '800', textAlign: 'center' },
    gateSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
    primaryBtn: {
        width: '100%', borderRadius: 14,
        paddingVertical: 14, alignItems: 'center', marginTop: 16,
    },
    primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    ghostBtn: { paddingVertical: 14, alignItems: 'center' },
    ghostBtnText: { fontSize: 14, fontWeight: '600' },
});
