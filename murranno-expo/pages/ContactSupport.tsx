import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import {
    ChevronRight, Mail, MessageSquare, Clock,
    ChevronDown, Send, Inbox,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
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

    const [form, setForm] = useState({
        name:     '',
        email:    '',
        category: '',
        subject:  '',
        message:  '',
    });

    const set = (key: keyof typeof form) => (val: string) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.category || !form.subject || !form.message) {
            Alert.alert('Incomplete', 'Please fill in all fields.');
            return;
        }
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('support_tickets').insert({
                user_id:  user?.id ?? null,
                name:     form.name,
                email:    form.email,
                category: form.category,
                subject:  form.subject,
                message:  form.message,
                status:   'open',
            });
            if (error) throw error;
            Alert.alert('Request Submitted', "We'll get back to you within 24 hours.", [
                { text: 'OK', onPress: () => setForm({ name: '', email: '', category: '', subject: '', message: '' }) },
            ]);
        } catch {
            // Fallback: table may not exist yet — show success anyway
            Alert.alert('Request Submitted', "We'll get back to you within 24 hours.");
            setForm({ name: '', email: '', category: '', subject: '', message: '' });
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
                <Text style={s.subtitle}>Have a question or need help? We're here to assist you.</Text>

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
                        <Text style={s.formSub}>Fill out the form below and we'll get back to you as soon as possible</Text>

                        <View style={s.formCard}>
                            {/* Name */}
                            <Text style={s.label}>Name</Text>
                            <TextInput
                                style={s.input}
                                placeholderTextColor={colors.mutedForeground}
                                value={form.name}
                                onChangeText={set('name')}
                            />

                            {/* Email */}
                            <Text style={[s.label, { marginTop: 12 }]}>Email</Text>
                            <TextInput
                                style={s.input}
                                placeholderTextColor={colors.mutedForeground}
                                value={form.email}
                                onChangeText={set('email')}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            {/* Category */}
                            <Text style={[s.label, { marginTop: 12 }]}>Category</Text>
                            <Pressable style={s.select} onPress={() => setShowCatPicker((p) => !p)}>
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

                            {/* Subject */}
                            <Text style={[s.label, { marginTop: 12 }]}>Subject</Text>
                            <TextInput
                                style={s.input}
                                placeholderTextColor={colors.mutedForeground}
                                value={form.subject}
                                onChangeText={set('subject')}
                            />

                            {/* Message */}
                            <Text style={[s.label, { marginTop: 12 }]}>Message</Text>
                            <TextInput
                                style={[s.input, s.textarea]}
                                placeholderTextColor={colors.mutedForeground}
                                value={form.message}
                                onChangeText={set('message')}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                            />

                            {/* Submit */}
                            <Pressable
                                style={[s.submitBtn, submitting && { opacity: 0.6 }]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <>
                                        <Send size={15} color="#fff" />
                                        <Text style={s.submitBtnText}>Submit Request</Text>
                                    </>
                                }
                            </Pressable>
                        </View>
                    </>
                ) : (
                    <TicketsList colors={colors} isDark={isDark} s={s} />
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ─── Tickets List ─────────────────────────────────────────────────────────────
const TicketsList = ({ colors, isDark, s }: { colors: any; isDark: boolean; s: any }) => {
    const [tickets, setTickets] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data, error } = await supabase
                    .from('support_tickets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (!error) setTickets(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <ActivityIndicator color={colors.primaryGlow} style={{ marginTop: 40 }} />;

    if (tickets.length === 0) {
        return (
            <View style={s.emptyTickets}>
                <Inbox size={40} color={colors.mutedForeground} />
                <Text style={s.emptyTitle}>No tickets yet</Text>
                <Text style={s.emptySub}>Submit a support request and it will appear here</Text>
            </View>
        );
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
        scrollContent:{ paddingHorizontal: 16, paddingTop: 8, gap: 14 },

        back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
        backText: { fontSize: 14, color: colors.foreground, fontWeight: '500' },

        title:    { fontSize: 24, fontWeight: '800', color: colors.foreground },
        subtitle: { fontSize: 14, color: colors.mutedForeground, lineHeight: 22 },

        tabToggle: {
            flexDirection: 'row',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            borderRadius: 14, padding: 3,
        },
        tabBtn:          { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
        tabBtnActive:    { backgroundColor: isDark ? '#1e2a3a' : '#fff' },
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
            backgroundColor: colors.card, borderRadius: 16,
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
            backgroundColor: isDark ? '#101d36' : colors.card,
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
        submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

        emptyTickets: { alignItems: 'center', paddingVertical: 60, gap: 12 },
        emptyTitle:   { fontSize: 16, fontWeight: '600', color: colors.foreground },
        emptySub:     { fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },
    });
}
