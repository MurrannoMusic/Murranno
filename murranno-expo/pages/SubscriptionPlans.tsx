import React, { useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check, Star } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useSubscriptions } from '@/hooks/useSubscriptions';

export const SubscriptionPlansPage = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { plans, currentSub, loading } = useSubscriptions();

    const handleUpgrade = () => {
        Alert.alert(
            'Upgrade Plan',
            'To upgrade or change your subscription, please visit the Murranno web app.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Web App', onPress: () => Linking.openURL('https://murranno.com/app/subscriptions') },
            ],
        );
    };

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <View style={s.header}>
                <Pressable style={s.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={22} color={colors.foreground} />
                </Pressable>
                <Text style={s.headerTitle}>Subscription Plans</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={s.centred}>
                    <ActivityIndicator color={colors.primaryGlow} size="large" />
                </View>
            ) : (
                <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Current plan banner */}
                    {currentSub && (
                        <View style={[s.currentBanner, { backgroundColor: `${colors.primaryGlow}18`, borderColor: colors.primaryGlow }]}>
                            <Text style={[s.currentLabel, { color: colors.primaryGlow }]}>Current Plan</Text>
                            <Text style={[s.currentPlan, { color: colors.foreground }]}>{currentSub.plan_name}</Text>
                            <Text style={[s.currentStatus, { color: colors.mutedForeground }]}>
                                Status: {currentSub.status}
                                {currentSub.current_period_end
                                    ? ` · Renews ${new Date(currentSub.current_period_end).toLocaleDateString()}`
                                    : ''}
                            </Text>
                        </View>
                    )}

                    {/* Plan cards */}
                    {plans.map((plan) => {
                        const isCurrent = currentSub?.plan_name?.toLowerCase() === plan.name?.toLowerCase();
                        return (
                            <View
                                key={plan.id}
                                style={[
                                    s.planCard,
                                    { backgroundColor: colors.card, borderColor: isCurrent ? colors.primaryGlow : colors.border },
                                    plan.is_popular && { borderColor: colors.primaryGlow },
                                ]}
                            >
                                {plan.is_popular && (
                                    <View style={[s.popularBadge, { backgroundColor: colors.primaryGlow }]}>
                                        <Star size={10} color="#fff" />
                                        <Text style={s.popularText}>Most Popular</Text>
                                    </View>
                                )}
                                <Text style={[s.planName, { color: colors.foreground }]}>{plan.name}</Text>
                                <View style={s.priceRow}>
                                    <Text style={[s.planPrice, { color: colors.foreground }]}>
                                        {plan.currency === 'NGN' ? '₦' : '$'}{plan.price.toLocaleString()}
                                    </Text>
                                    <Text style={[s.planInterval, { color: colors.mutedForeground }]}>/{plan.interval}</Text>
                                </View>
                                {(plan.features ?? []).map((feature, i) => (
                                    <View key={i} style={s.featureRow}>
                                        <Check size={14} color='#22c55e' />
                                        <Text style={[s.featureText, { color: colors.foreground }]}>{feature}</Text>
                                    </View>
                                ))}
                                <Pressable
                                    style={[
                                        s.planBtn,
                                        isCurrent
                                            ? { backgroundColor: `${colors.primaryGlow}20`, borderWidth: 1, borderColor: colors.primaryGlow }
                                            : { backgroundColor: colors.primaryGlow },
                                    ]}
                                    onPress={isCurrent ? undefined : handleUpgrade}
                                    disabled={isCurrent}
                                >
                                    <Text style={[s.planBtnText, { color: isCurrent ? colors.primaryGlow : '#fff' }]}>
                                        {isCurrent ? 'Current Plan' : 'Upgrade'}
                                    </Text>
                                </Pressable>
                            </View>
                        );
                    })}

                    {plans.length === 0 && (
                        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                            <Text style={{ color: colors.mutedForeground }}>No plans available.</Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen:        { flex: 1, backgroundColor: colors.background },
        scroll:        { flex: 1 },
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 8 },
        centred:       { flex: 1, justifyContent: 'center', alignItems: 'center' },

        header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, flex: 1, textAlign: 'center' },
        backBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

        currentBanner: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
        currentLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
        currentPlan:   { fontSize: 20, fontWeight: '800' },
        currentStatus: { fontSize: 12 },

        planCard:     { borderRadius: 20, borderWidth: 1, padding: 20, gap: 10, overflow: 'hidden' },
        popularBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 4 },
        popularText:  { fontSize: 11, fontWeight: '700', color: '#fff' },
        planName:     { fontSize: 18, fontWeight: '800' },
        priceRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
        planPrice:    { fontSize: 30, fontWeight: '800' },
        planInterval: { fontSize: 14 },
        featureRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
        featureText:  { fontSize: 13 },
        planBtn:      { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
        planBtnText:  { fontSize: 14, fontWeight: '700' },
    });
