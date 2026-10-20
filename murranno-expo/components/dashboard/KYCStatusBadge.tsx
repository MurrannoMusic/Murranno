import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ShieldCheck, ShieldAlert, Clock, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useArtistProfile } from '@/hooks/useArtistProfile';

export const KYCStatusBadge = () => {
    const router = useRouter();
    const { colors } = useTheme();
    const { profile, loading } = useArtistProfile();

    if (loading || !profile || profile.kyc_status === 'verified') return null;

    const status = profile.kyc_status || 'unverified';

    const config = {
        unverified: {
            label: 'Verification Required',
            sub: 'Verify your ID to enable music distribution',
            Icon: ShieldAlert,
            color: colors.warning,
            bg: `${colors.warning}15`,
        },
        pending: {
            label: 'Verification Pending',
            sub: 'We are reviewing your documents',
            Icon: Clock,
            color: colors.primary,
            bg: `${colors.primary}12`,
        },
        verified: {
            label: 'Fully Verified',
            sub: 'Your account is in good standing',
            Icon: ShieldCheck,
            color: colors.success,
            bg: `${colors.success}15`,
        },
        rejected: {
            label: 'Verification Failed',
            sub: 'Please re-submit your documents',
            Icon: ShieldAlert,
            color: colors.destructive,
            bg: `${colors.destructive}15`,
        }
    }[status] || {
        label: 'Verification Required',
        sub: 'Complete your profile',
        Icon: ShieldAlert,
        color: colors.warning,
        bg: `${colors.warning}15`,
    };

    const Icon = config.Icon;

    return (
        <Pressable
            style={[styles.container, { backgroundColor: config.bg, borderColor: `${config.color}30` }]}
            accessibilityRole="button"
            onPress={() => router.push('/app/kyc' as any)}
        >
            <View style={[styles.iconWrap, { backgroundColor: config.color }]}>
                <Icon size={14} color={colors.background} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
                <Text style={[styles.sub, { color: colors.mutedForeground }]} numberOfLines={1}>{config.sub}</Text>
            </View>
            <ChevronRight size={16} color={config.color} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
        marginBottom: 8,
    },
    iconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        gap: 2,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',

        letterSpacing: 0.5,
    },
    sub: {
        fontSize: 11,
        opacity: 0.7,
        color: '#888',
    }
});
