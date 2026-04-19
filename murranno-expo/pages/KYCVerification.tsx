import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { ShieldAlert, Shield, CheckCircle, Upload, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

// ─── KYC Gate (Verification Required prompt) ─────────────────────────────────

export const KYCGate = ({ onComplete }: { onComplete?: () => void }) => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={s.gateCard}>
                <View style={s.shieldWrap}>
                    <ShieldAlert size={36} color={colors.warning} />
                </View>
                <Text style={s.gateTitle}>Verification Required</Text>
                <Text style={s.gateSubtitle}>
                    To access this feature (Uploads & Transactions), you need to verify your identity.
                </Text>
                <Pressable
                    style={s.primaryBtn}
                    onPress={() => router.push('/app/kyc' as any)}
                >
                    <Text style={s.primaryBtnText}>Complete KYC Verification</Text>
                </Pressable>
                <Pressable style={s.ghostBtn} onPress={() => router.back()}>
                    <Text style={s.ghostBtnText}>Go Back</Text>
                </Pressable>
            </View>
        </View>
    );
};

// ─── KYC Form ─────────────────────────────────────────────────────────────────

export const KYCVerification = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { uploadImage, uploading } = useCloudinaryUpload();

    const [ninNumber, setNinNumber]     = useState('');
    const [docUri, setDocUri]           = useState<string | null>(null);
    const [docName, setDocName]         = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickDocument = () => {
        Alert.alert(
            'Document Picker Required',
            'To pick ID documents, install expo-document-picker:\n\nnpx expo install expo-document-picker',
            [{ text: 'OK' }],
        );
    };

    const handleSubmit = async () => {
        if (!ninNumber || ninNumber.length < 11) {
            Alert.alert('Missing Info', 'Please enter a valid 11-digit NIN number');
            return;
        }
        if (!docUri) {
            Alert.alert('Missing Document', 'Please upload your ID document');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Upload document
            const { url: docUrl } = await uploadImage({ uri: docUri, type: 'image/jpeg', name: docName ?? 'kyc_doc.jpg' }, 'kyc-documents');

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    nin_number:        ninNumber,
                    id_document_url:   docUrl,
                    id_document_type:  'national_id',
                    kyc_status:        'pending',
                    kyc_tier:          1,
                })
                .eq('id', user.id);

            if (error) throw error;

            Alert.alert(
                'Verification Submitted',
                'Your documents are being reviewed. You will be notified once approved.',
                [{ text: 'OK', onPress: () => router.back() }],
            );
        } catch (err: any) {
            console.error('KYC error:', err);
            Alert.alert('Submission Failed', err.message || 'Could not submit verification. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={s.title}>Identity Verification</Text>
                <Text style={s.subtitle}>
                    We need to verify your identity before you can upload music or withdraw funds.
                </Text>

                <View style={s.card}>
                    {/* NIN */}
                    <Text style={s.label}>NIN Number (National Identification Number)</Text>
                    <TextInput
                        style={s.input}
                        placeholder="Enter your 11-digit NIN"
                        placeholderTextColor={colors.mutedForeground}
                        value={ninNumber}
                        onChangeText={(v) => setNinNumber(v.replace(/\D/g, '').slice(0, 11))}
                        keyboardType="numeric"
                    />
                    <View style={s.secureRow}>
                        <Shield size={12} color={colors.mutedForeground} />
                        <Text style={s.secureText}>Your info is encrypted securely.</Text>
                    </View>

                    {/* Doc upload */}
                    <Text style={[s.label, { marginTop: 16 }]}>ID Document Upload</Text>
                    <Pressable style={s.docDropzone} onPress={pickDocument}>
                        {docUri ? (
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <CheckCircle size={24} color={colors.success} />
                                <Text style={s.docName} numberOfLines={1}>{docName ?? 'Document selected'}</Text>
                                <Text style={s.docChangeTip}>Tap to change</Text>
                            </View>
                        ) : (
                            <View style={{ alignItems: 'center', gap: 6 }}>
                                <Upload size={24} color={colors.mutedForeground} />
                                <Text style={s.docTitle}>Upload NIN Card or Passport</Text>
                                <Text style={s.docSub}>JPG, PNG or PDF up to 5MB</Text>
                            </View>
                        )}
                    </Pressable>

                    {/* Warning */}
                    <View style={s.warningBox}>
                        <AlertCircle size={14} color={colors.warning} />
                        <Text style={s.warningText}>
                            Ensure your document is clear and matches your profile name to avoid rejection.
                        </Text>
                    </View>

                    {/* Buttons */}
                    <Pressable
                        style={[s.primaryBtn, (isSubmitting || uploading) && { opacity: 0.5 }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting || uploading}
                    >
                        {isSubmitting || uploading
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={s.primaryBtnText}>Submit for Verification</Text>
                        }
                    </Pressable>
                    <Pressable style={s.ghostBtn} onPress={() => router.back()}>
                        <Text style={s.ghostBtnText}>Cancel</Text>
                    </Pressable>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ─── styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1 },
        scrollContent: { paddingHorizontal: 16, paddingTop: 60, gap: 14 },

        // Gate styles
        gateCard: {
            flex: 1, alignItems: 'center', justifyContent: 'center',
            paddingHorizontal: 32, gap: 16, marginTop: 80,
        },
        shieldWrap: {
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : 'rgba(0,0,0,0.06)',
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 1, borderColor: `${colors.warning}30`,
        },
        gateTitle:    { fontSize: 22, fontWeight: '800', color: colors.foreground, textAlign: 'center' },
        gateSubtitle: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', lineHeight: 22 },

        // KYC form styles
        title:    { fontSize: 24, fontWeight: '800', color: colors.foreground },
        subtitle: { fontSize: 14, color: colors.mutedForeground, lineHeight: 22 },

        card: {
            backgroundColor: colors.card, borderRadius: 20,
            borderWidth: 1, borderColor: colors.border, padding: 16,
        },
        label: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 6 },
        input: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1, borderColor: colors.border, borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.foreground,
        },
        secureRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
        secureText: { fontSize: 11, color: colors.mutedForeground },

        docDropzone: {
            borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border,
            borderRadius: 14, paddingVertical: 32, alignItems: 'center', justifyContent: 'center',
        },
        docTitle:     { fontSize: 14, fontWeight: '600', color: colors.foreground },
        docSub:       { fontSize: 11, color: colors.mutedForeground },
        docName:      { fontSize: 13, fontWeight: '600', color: colors.success, maxWidth: 200 },
        docChangeTip: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },

        warningBox: {
            flexDirection: 'row', gap: 8, marginTop: 14,
            backgroundColor: `${colors.warning}18`,
            borderWidth: 1, borderColor: `${colors.warning}30`,
            borderRadius: 10, padding: 10,
        },
        warningText: { flex: 1, fontSize: 12, color: colors.warning, lineHeight: 18 },

        primaryBtn: {
            backgroundColor: colors.primaryGlow, borderRadius: 14,
            paddingVertical: 14, alignItems: 'center', marginTop: 16,
        },
        primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
        ghostBtn: { paddingVertical: 14, alignItems: 'center' },
        ghostBtnText: { fontSize: 14, fontWeight: '600', color: colors.foreground },
    });
