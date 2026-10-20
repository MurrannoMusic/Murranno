import { invoke, notify } from '@/lib/api';
import { appRedirect } from '@/lib/auth';
import * as WebBrowser from 'expo-web-browser';
import React, { useMemo, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check, Star } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useSubscriptions } from '@/hooks/useSubscriptions';

export const SubscriptionPlansPage = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { plans, currentSub, subscriptions, loading, error, refetch } = useSubscriptions();

    const [checkout, setCheckout] = useState<string | null>(null);
    const handleUpgrade = async (tier: string) => {
        setCheckout(tier);
        try {
            const redirectTo = appRedirect('payment-return');
            const result = await invoke<any>('paystack-initialize-subscription', {tier, redirectTo});
            if (!result.authorization_url) { await refetch(); notify('Subscription', result.message || 'Plan activated.'); return; }
            if (Platform.OS === 'web') { window.location.assign(result.authorization_url); return; }
            const session = await WebBrowser.openAuthSessionAsync(result.authorization_url, redirectTo);
            if (session.type === 'success') { const url = new URL(session.url); const reference = url.searchParams.get('reference') || url.searchParams.get('trxref') || result.reference; await invoke('paystack-verify-subscription', {reference}); await refetch(); notify('Subscription', 'Your subscription is active.'); }
            else { await refetch(); notify('Checkout closed', 'No subscription change has been confirmed. You can try again.'); }
        } catch (e: any) { notify('Unable to change plan', e.message); } finally { setCheckout(null); }
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

                    {!!error && <Pressable onPress={refetch}><Text style={{color: colors.destructive}}>{error} · Tap to retry</Text></Pressable>}
                    {/* Current plan banner */}
                    {currentSub && (
                        <View style={[s.currentBanner, { backgroundColor: `${colors.primaryGlow}18`, borderColor: colors.primaryGlow }]}>
                            <Text style={[s.currentLabel, { color: colors.primaryGlow }]}>Current Plan</Text>
                            <Text style={[s.currentPlan, { color: colors.foreground }]}>{currentSub.plan_name}</Text>
                            <Text style={[s.currentStatus, { color: colors.mutedForeground }]}>
                                Status: {currentSub.status}
                                {currentSub.current_period_end
                                    ? ` · Access until ${new Date(currentSub.current_period_end).toLocaleDateString()}`
                                    : ''}
                            </Text>
                        </View>
                    )}

                    {/* Plan cards */}
                    {plans.map((plan) => {
                        const isCurrent = subscriptions.some(v => v.isActive && v.tier === plan.tier);
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
                                        <Star size={10} color={colors.onPrimary} />
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
                                    onPress={() => handleUpgrade(plan.tier)}
                                    disabled={isCurrent || !!checkout || plan.tier === 'artist'}
                                >
                                    <Text style={[s.planBtnText, { color: isCurrent ? colors.primaryGlow : colors.onPrimary }]}>
                                        {checkout === plan.tier ? 'Opening checkout…' : isCurrent ? 'Current Plan' : plan.tier === 'artist' ? 'Included with your account' : 'Choose plan'}
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
        scrollContent: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, gap: 14, paddingTop: 8 },
        centred:       { flex: 1, justifyContent: 'center', alignItems: 'center' },

        header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, flex: 1, textAlign: 'center' },
        backBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

        currentBanner: { borderRadius: 10, borderWidth: 1, padding: 16, gap: 4 },
        currentLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
        currentPlan:   { fontSize: 20, fontWeight: '600' },
        currentStatus: { fontSize: 12 },

        planCard:     { borderRadius: 12, borderWidth: 1, padding: 20, gap: 10, overflow: 'hidden' },
        popularBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 4 },
        popularText:  { fontSize: 11, fontWeight: '700', color: colors.onPrimary },
        planName:     { fontSize: 18, fontWeight: '600' },
        priceRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
        planPrice:    { fontSize: 30, fontWeight: '600' },
        planInterval: { fontSize: 14 },
        featureRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
        featureText:  { fontSize: 13 },
        planBtn:      { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
        planBtnText:  { fontSize: 14, fontWeight: '700' },
    });
