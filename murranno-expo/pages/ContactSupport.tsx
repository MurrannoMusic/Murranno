import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, TextInput, ActivityIndicator,
} from 'react-native';
import {
    ChevronRight, Mail, MessageSquare,
    ChevronDown, Send, Inbox,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { FormError, FormField } from '@/components/forms/FormField';
import { EmptyState, ErrorState, ListSkeleton, SuccessState, friendlyError } from '@/components/states/StateViews';
import { email as emailRule, minLength, required, validate } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/layout/AppHeader';

// ─── data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
    'Distribution Issue',
    'Payment / Withdrawal',
    'Account Access',
    'Music Upload',
    'Analytics Question',
    'KYC / Verification',
    'Technical Bug',
    'Other',
];

// ─── component ────────────────────────────────────────────────────────────────

export const ContactSupport = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const [activeTab, setActiveTab] = useState<'request' | 'tickets'>('request');
    const [showCatPicker, setShowCatPicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'category' | 'subject' | 'message' | 'form', string>>>({});
    const [submitted, setSubmitted] = useState(false);
    const [ticketsRevision, setTicketsRevision] = useState(0);

    const [form, setForm] = useState({
        name:     '',
        email:    '',
        category: '',
        subject:  '',
        message:  '',
    });

    const set = (key: keyof typeof form) => (val: string) => {
        setForm((prev) => ({ ...prev, [key]: val }));
        setErrors({});
    };

    const handleSubmit = async () => {
        const found = validate(form, {
            name: [required('your name')],
            email: [emailRule],
            category: [(v) => (v ? '' : 'Choose a category')],
            subject: [required('a subject'), minLength(4, 'Subject')],
            message: [required('your message'), minLength(20, 'Message')],
        });
        setErrors(found);
        if (Object.keys(found).length) return;
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Please sign in again.');
            const { error } = await supabase.from('support_tickets').insert({
                user_id:  user?.id ?? null,
                name:     form.name.trim(),
                email:    form.email.trim(),
                category: form.category,
                subject:  form.subject.trim(),
                message:  form.message.trim(),
                status:   'open',
            });
            if (error) throw error;
            setForm({ name: '', email: '', category: '', subject: '', message: '' });
            setTicketsRevision((n) => n + 1);
            setSubmitted(true);
        } catch (error: any) {
            setErrors({ form: `${friendlyError(error).message} Your message has been kept.` });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Back */}
                <Pressable style={s.back} onPress={() => router.back()}>
                    <ChevronRight size={16} color={colors.foreground} style={{ transform: [{ rotate: '180deg' }] }} />
                    <Text style={s.backText}>Back</Text>
                </Pressable>

                <Text style={s.title}>Contact Support</Text>
                <Text style={s.subtitle}>Have a question or need help? We&apos;re here to assist you.</Text>

                {/* Tab toggle */}
                <View style={s.tabToggle}>
                    <Pressable
                        style={[s.tabBtn, activeTab === 'request' && s.tabBtnActive]}
                        onPress={() => setActiveTab('request')}
                    >
                        <Text style={[s.tabBtnText, activeTab === 'request' && s.tabBtnTextActive]}>
                            Submit Request
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[s.tabBtn, activeTab === 'tickets' && s.tabBtnActive]}
                        onPress={() => setActiveTab('tickets')}
                    >
                        <Text style={[s.tabBtnText, activeTab === 'tickets' && s.tabBtnTextActive]}>
                            My Tickets
                        </Text>
                    </Pressable>
                </View>

                {activeTab === 'request' ? (
                    <>
                        {/* Info cards */}
                        <View style={s.infoGroup}>
                            {[
                                { Icon: Mail,           label: 'Email Support',  value: 'support@murrannomusic.co' },
                                { Icon: MessageSquare,  label: 'Response Time',  value: 'Within 24 hours'           },
                                { Icon: MessageSquare,  label: 'Live Chat',      value: 'Coming Soon'               },
                            ].map(({ Icon, label, value }) => (
                                <View key={label} style={s.infoCard}>
                                    <Icon size={20} color={colors.primaryGlow} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.infoLabel}>{label}</Text>
                                        <Text style={s.infoValue}>{value}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Form */}
                        <Text style={s.formTitle}>Submit a Support Request</Text>
                        <Text style={s.formSub}>Fill out the form below and we&apos;ll get back to you as soon as possible</Text>

                        {submitted ? (
                            <View style={s.formCard}>
                                <SuccessState
                                    title="Request sent"
                                    body="Thanks for reaching out. Our team replies within 24 hours, by email and under My Tickets."
                                    action={{ label: 'View my tickets', onPress: () => { setSubmitted(false); setActiveTab('tickets'); } }}
                                    secondary={{ label: 'Send another', onPress: () => setSubmitted(false) }}
                                />
                            </View>
                        ) : (
                        <View style={s.formCard}>
                            {/* Name */}
                            <FormField label="Name" value={form.name} onChangeText={set('name')} autoComplete="name" textContentType="name" error={errors.name} />

                            {/* Email */}
                            <FormField containerStyle={{ marginTop: 12 }} label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email} />

                            {/* Category */}
                            <Text style={[s.label, { marginTop: 12 }]}>Category</Text>
                            <Pressable accessibilityRole="button" accessibilityLabel={form.category ? `Category: ${form.category}. Change` : 'Select a category'} style={[s.select, !!errors.category && { borderColor: colors.destructive }]} onPress={() => setShowCatPicker((p) => !p)}>
                                <Text style={form.category ? s.selectValue : s.selectPlaceholder}>
                                    {form.category || 'Select a category'}
                                </Text>
                                <ChevronDown size={16} color={colors.mutedForeground} />
                            </Pressable>
                            {showCatPicker && (
                                <View style={s.picker}>
                                    {CATEGORIES.map((cat) => (
                                        <Pressable
                                            key={cat}
                                            style={[s.pickerItem, cat === form.category && s.pickerItemActive]}
                                            onPress={() => { set('category')(cat); setShowCatPicker(false); }}
                                        >
                                            <Text style={[s.pickerItemText, cat === form.category && { color: colors.primaryGlow }]}>
                                                {cat}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                            {!!errors.category && <Text accessibilityRole="alert" style={{ color: colors.destructive, fontSize: 12, marginTop: 6 }}>{errors.category}</Text>}

                            {/* Subject */}
                            <FormField containerStyle={{ marginTop: 12 }} label="Subject" value={form.subject} onChangeText={set('subject')} placeholder="e.g. My release isn’t on Spotify yet" error={errors.subject} />

                            {/* Message */}
                            <FormField
                                containerStyle={{ marginTop: 12 }}
                                label="Message"
                                value={form.message}
                                onChangeText={set('message')}
                                placeholder="Tell us what happened, and include the release or transaction if it’s related."
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                                style={{ minHeight: 110 }}
                                error={errors.message}
                            />

                            <View style={{ marginTop: 12 }}><FormError message={errors.form} /></View>

                            {/* Submit */}
                            <Pressable
                                style={[s.submitBtn, submitting && { opacity: 0.6 }]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting
                                    ? <ActivityIndicator color={colors.onPrimary} size="small" />
                                    : <>
                                        <Send size={15} color={colors.onPrimary} />
                                        <Text style={s.submitBtnText}>Submit Request</Text>
                                    </>
                                }
                            </Pressable>
                        </View>
                        )}
                    </>
                ) : (
                    <TicketsList key={ticketsRevision} colors={colors} isDark={isDark} s={s} onNew={() => setActiveTab('request')} />
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ─── Tickets List ─────────────────────────────────────────────────────────────
const TicketsList = ({ colors, isDark, s, onNew }: { colors: any; isDark: boolean; s: any; onNew?: () => void }) => {
    const [tickets, setTickets] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [revision, setRevision] = React.useState(0);

    React.useEffect(() => {
        (async () => {
            setLoading(true); setError('');
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data, error } = await supabase
                    .from('support_tickets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setTickets(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Tickets could not be loaded.');
            } finally {
                setLoading(false);
            }
        })();
    }, [revision]);

    if (loading) return <ListSkeleton rows={3} media={false} />;

    if (error) return <ErrorState error={error} title="Couldn’t load your tickets" onRetry={() => setRevision(n => n + 1)} />;
    if (tickets.length === 0) {
        return <EmptyState icon={Inbox} title="No tickets yet" body="When you send us a request it shows up here with its status and our replies." action={onNew ? { label: 'Contact support', onPress: onNew } : undefined} />;
    }

    return (
        <View style={{ gap: 10 }}>
            {tickets.map((t) => (
                <View key={t.id} style={{
                    backgroundColor: colors.card,
                    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
                    padding: 14, gap: 4,
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.foreground }} numberOfLines={1}>{t.subject}</Text>
                        <View style={{
                            paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
                            backgroundColor: t.status === 'open' ? `${colors.success}18` : `${colors.mutedForeground}18`,
                        }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: t.status === 'open' ? colors.success : colors.mutedForeground, textTransform: 'uppercase' }}>
                                {t.status}
                            </Text>
                        </View>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground }} numberOfLines={2}>{t.message}</Text>
                    <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 4 }}>
                        {new Date(t.created_at).toLocaleDateString()}
                    </Text>
                </View>
            ))}
        </View>
    );
};

// ─── styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
    return StyleSheet.create({
        screen:       { flex: 1, backgroundColor: colors.background },
        scroll:       { flex: 1 },
        scrollContent:{ width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 8, gap: 14 },

        back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
        backText: { fontSize: 14, color: colors.foreground, fontWeight: '500' },

        title:    { fontSize: 24, fontWeight: '600', color: colors.foreground },
        subtitle: { fontSize: 14, color: colors.mutedForeground, lineHeight: 22 },

        tabToggle: {
            flexDirection: 'row',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            borderRadius: 14, padding: 3,
        },
        tabBtn:          { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
        tabBtnActive:    { backgroundColor: colors.secondary },
        tabBtnText:      { fontSize: 13, fontWeight: '600', color: colors.mutedForeground },
        tabBtnTextActive:{ color: colors.foreground },

        infoGroup: { gap: 8 },
        infoCard: {
            flexDirection: 'row', alignItems: 'center', gap: 14,
            backgroundColor: colors.card, borderRadius: 14,
            borderWidth: 1, borderColor: colors.border, padding: 14,
        },
        infoLabel: { fontSize: 13, fontWeight: '600', color: colors.foreground },
        infoValue: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },

        formTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground },
        formSub:   { fontSize: 13, color: colors.mutedForeground, lineHeight: 20, marginTop: -8 },

        formCard: {
            backgroundColor: colors.card, borderRadius: 10,
            borderWidth: 1, borderColor: colors.border, padding: 16,
        },
        label: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 6 },
        input: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1, borderColor: colors.border, borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.foreground,
        },
        textarea: { height: 110, paddingTop: 10 },

        select: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1, borderColor: colors.border, borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 12,
        },
        selectValue:      { fontSize: 14, color: colors.foreground },
        selectPlaceholder:{ fontSize: 14, color: colors.mutedForeground },

        picker: {
            backgroundColor: colors.card,
            borderRadius: 10, borderWidth: 1, borderColor: colors.border,
            overflow: 'hidden', marginTop: 4,
        },
        pickerItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        pickerItemActive: { backgroundColor: `${colors.primaryGlow}15` },
        pickerItemText: { fontSize: 14, color: colors.foreground },

        submitBtn: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: colors.primaryGlow, borderRadius: 12,
            paddingVertical: 14, marginTop: 16,
        },
        submitBtnText: { fontSize: 15, fontWeight: '700', color: colors.onPrimary },

        emptyTickets: { alignItems: 'center', paddingVertical: 60, gap: 12 },
        emptyTitle:   { fontSize: 16, fontWeight: '600', color: colors.foreground },
        emptySub:     { fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },
    });
}
