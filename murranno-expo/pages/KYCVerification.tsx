import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, TextInput, Alert, Image,
} from 'react-native';
import {
    ShieldAlert, Shield, CheckCircle, Upload,
    AlertCircle, Camera, ChevronRight, FileText,
    UserCheck, CreditCard, Landmark,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { useArtistProfile } from '@/hooks/useArtistProfile';

// ─── types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;
type IDType = 'nin' | 'passport' | 'voter_card' | 'drivers_license';

const ID_TYPES: { id: IDType; label: string; icon: any }[] = [
    { id: 'nin',             label: 'National ID (NIN)', icon: CreditCard },
    { id: 'passport',        label: 'International Passport', icon: Landmark },
    { id: 'voter_card',      label: 'Voter\'s Card', icon: UserCheck },
    { id: 'drivers_license', label: 'Driver\'s License', icon: FileText },
];

// ─── component ────────────────────────────────────────────────────────────────

export const KYCVerification = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { uploadImage, uploading } = useCloudinaryUpload();
    const { profile, refetch: refetchProfile } = useArtistProfile();

    const [step, setStep]               = useState<Step>(1);
    const [idType, setIdType]           = useState<IDType>('nin');
    const [ninNumber, setNinNumber]     = useState('');
    const [docUri, setDocUri]           = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─── capture logic ───

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!result.canceled) setDocUri(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });
        if (!result.canceled) setDocUri(result.assets[0].uri);
    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['image/*', 'application/pdf'],
        });
        if (!result.canceled) setDocUri(result.assets[0].uri);
    };

    // ─── submission ───

    const handleSubmit = async () => {
        if (idType === 'nin' && ninNumber.length < 11) {
            Alert.alert('Incomplete', 'Please enter a valid 11-digit NIN.');
            return;
        }
        if (idType !== 'nin' && !docUri) {
            Alert.alert('Missing ID', 'Please capture or upload your ID document.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Upload to Cloudinary (optional for NIN)
            let docUrl = null;
            if (docUri) {
                const res = await uploadImage(
                    { uri: docUri, type: 'image/jpeg', name: `kyc_${idType}_${user.id}.jpg` },
                    'kyc-documents'
                );
                docUrl = res.url;
            }

            // 2. Update DB
            const { error } = await supabase
                .from('profiles')
                .update({
                    nin_number:        idType === 'nin' ? ninNumber : null,
                    id_document_url:   docUrl,
                    id_document_type:  idType,
                    kyc_status:        'pending',
                    kyc_tier:          1,
                })
                .eq('id', user.id);

            if (error) throw error;

            await refetchProfile();
            setStep(3); // Show success step
        } catch (err: any) {
            console.error('KYC error:', err);
            Alert.alert('Error', err.message || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── renderers ───

    const renderStep1 = () => (
        <View style={s.stepContainer}>
            <Text style={s.sectionTitle}>Step 1: Select ID Type</Text>
            <Text style={s.sectionSub}>Choose the document you want to use for verification</Text>
            
            <View style={s.optionsGrid}>
                {ID_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                        <Pressable
                            key={type.id}
                            style={[s.idOption, idType === type.id && s.idOptionActive]}
                            onPress={() => setIdType(type.id)}
                        >
                            <View style={[s.idIconWrap, idType === type.id && { backgroundColor: colors.primaryGlow }]}>
                                <Icon size={20} color={idType === type.id ? '#fff' : colors.mutedForeground} />
                            </View>
                            <Text style={[s.idLabel, idType === type.id && { color: colors.foreground }]}>{type.label}</Text>
                        </Pressable>
                    );
                })}
            </View>

            <Pressable style={s.nextBtn} onPress={() => setStep(2)}>
                <Text style={s.nextBtnText}>Continue</Text>
                <ChevronRight size={18} color="#fff" />
            </Pressable>
        </View>
    );

    const renderStep2 = () => (
        <View style={s.stepContainer}>
            <Text style={s.sectionTitle}>Step 2: Capture Document</Text>
            <Text style={s.sectionSub}>
                {idType === 'nin' 
                    ? 'Optional: Take a photo of your NIN slip (Verification can be done with just the number below)' 
                    : 'Take a clear photo of your ID or upload a file'}
            </Text>

            {docUri ? (
                <View style={s.previewCard}>
                    <Image source={{ uri: docUri }} style={s.previewImg} resizeMode="contain" />
                    <Pressable style={s.retakeBtn} onPress={() => setDocUri(null)}>
                        <Text style={s.retakeBtnText}>Retake Photo</Text>
                    </Pressable>
                </View>
            ) : (
                <View style={s.captureGroup}>
                    <Pressable style={s.captureBtn} onPress={takePhoto}>
                        <Camera size={32} color={colors.primaryGlow} />
                        <Text style={s.captureBtnText}>Live Camera</Text>
                        <Text style={s.captureBtnSub}>Recommended for faster approval</Text>
                    </Pressable>
                    <View style={s.dividerRow}>
                        <View style={s.line} /><Text style={s.dividerText}>OR</Text><View style={s.line} />
                    </View>
                    <View style={s.secondaryCaptureRow}>
                        <Pressable style={s.subCaptureBtn} onPress={pickImage}>
                            <Upload size={20} color={colors.foreground} />
                            <Text style={s.subCaptureText}>Gallery</Text>
                        </Pressable>
                        <Pressable style={s.subCaptureBtn} onPress={pickDocument}>
                            <FileText size={20} color={colors.foreground} />
                            <Text style={s.subCaptureText}>Files</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {idType === 'nin' && (
                <View style={{ marginTop: 24 }}>
                    <Text style={s.label}>Enter NIN Number</Text>
                    <TextInput
                        style={s.input}
                        placeholder="11-digit NIN"
                        placeholderTextColor={colors.mutedForeground}
                        value={ninNumber}
                        onChangeText={(v) => setNinNumber(v.replace(/\D/g, '').slice(0, 11))}
                        keyboardType="numeric"
                    />
                </View>
            )}

            <View style={s.btnGroup}>
                <Pressable style={s.backBtn} onPress={() => setStep(1)}>
                    <Text style={s.backBtnText}>Back</Text>
                </Pressable>
                <Pressable 
                    style={[s.primaryBtn, (isSubmitting || uploading || (!docUri && idType !== 'nin')) && { opacity: 0.5 }]} 
                    onPress={handleSubmit}
                    disabled={isSubmitting || uploading || (!docUri && idType !== 'nin')}
                >
                    {isSubmitting || uploading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.primaryBtnText}>Submit Verification</Text>}
                </Pressable>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={s.successContainer}>
            <View style={s.successCircle}>
                <CheckCircle size={48} color={colors.success} />
            </View>
            <Text style={s.successTitle}>Verification Submitted</Text>
            <Text style={s.successSub}>
                We've received your documents. Our team is reviewing them now. This usually takes 12-24 hours.
            </Text>
            <Pressable style={s.finishBtn} onPress={() => router.replace('/app/dashboard' as any)}>
                <Text style={s.finishBtnText}>Go to Dashboard</Text>
            </Pressable>
        </View>
    );

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Progress Header */}
                <View style={s.progressRow}>
                    {[1, 2, 3].map((num) => (
                        <View key={num} style={{ flex: 1, alignItems: 'center' }}>
                            <View style={[s.dot, step >= num && s.dotActive]}>
                                <Text style={[s.dotText, step >= num && { color: '#fff' }]}>{num}</Text>
                            </View>
                            <View style={[s.progressLine, step > num && s.progressLineActive]} />
                        </View>
                    ))}
                </View>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ─── styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: any, isDark: boolean) =>
    StyleSheet.create({
        screen: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1 },
        scrollContent: { paddingHorizontal: 16, paddingTop: 60, gap: 20 },

        progressRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 40, marginBottom: 10 },
        dot: {
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            justifyContent: 'center', alignItems: 'center', zIndex: 2,
        },
        dotActive: { backgroundColor: colors.primaryGlow },
        dotText:   { fontSize: 12, fontWeight: '700', color: colors.mutedForeground },
        progressLine: {
            position: 'absolute', left: '60%', top: 13, width: '80%', height: 2,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        },
        progressLineActive: { backgroundColor: colors.primaryGlow },

        stepContainer: { gap: 16 },
        sectionTitle:  { fontSize: 24, fontWeight: '800', color: colors.foreground },
        sectionSub:    { fontSize: 14, color: colors.mutedForeground, lineHeight: 22 },

        optionsGrid: { gap: 12, marginTop: 10 },
        idOption: {
            flexDirection: 'row', alignItems: 'center', gap: 14,
            padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
            backgroundColor: colors.card,
        },
        idOptionActive: { borderColor: colors.primaryGlow, backgroundColor: `${colors.primaryGlow}08` },
        idIconWrap: {
            width: 40, height: 40, borderRadius: 10,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            justifyContent: 'center', alignItems: 'center',
        },
        idLabel: { fontSize: 15, fontWeight: '600', color: colors.mutedForeground },

        nextBtn: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: colors.primaryGlow, borderRadius: 14, paddingVertical: 16, marginTop: 10,
        },
        nextBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

        // Step 2
        captureGroup: { gap: 20, marginTop: 10 },
        captureBtn: {
            backgroundColor: colors.card, borderRadius: 20, paddingVertical: 40,
            alignItems: 'center', justifyContent: 'center', borderWidth: 2,
            borderStyle: 'dashed', borderColor: colors.primaryGlow, gap: 10,
        },
        captureBtnText: { fontSize: 18, fontWeight: '700', color: colors.foreground },
        captureBtnSub:  { fontSize: 12, color: colors.mutedForeground },

        dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20 },
        line:        { flex: 1, height: 1, backgroundColor: colors.border },
        dividerText: { fontSize: 11, fontWeight: '700', color: colors.mutedForeground },

        secondaryCaptureRow: { flexDirection: 'row', gap: 12 },
        subCaptureBtn: {
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
            backgroundColor: colors.card,
        },
        subCaptureText: { fontSize: 14, fontWeight: '600', color: colors.foreground },

        previewCard: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#000', height: 240, justifyContent: 'center' },
        previewImg:  { width: '100%', height: '100%' },
        retakeBtn:   { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
        retakeBtnText:{ fontSize: 12, color: '#fff', fontWeight: '600' },

        label: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
        input: {
            backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
            borderRadius: 12, padding: 14, fontSize: 16, color: colors.foreground,
        },

        btnGroup: { flexDirection: 'row', gap: 12, marginTop: 24 },
        backBtn:  { flex: 0.4, paddingVertical: 14, alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: colors.border },
        backBtnText: { fontSize: 15, fontWeight: '600', color: colors.foreground },
        primaryBtn:  { flex: 1, backgroundColor: colors.primaryGlow, borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
        primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

        // Success
        successContainer: { alignItems: 'center', paddingVertical: 40, gap: 20 },
        successCircle:    { width: 90, height: 90, borderRadius: 45, backgroundColor: `${colors.success}18`, justifyContent: 'center', alignItems: 'center' },
        successTitle:     { fontSize: 24, fontWeight: '800', color: colors.foreground, textAlign: 'center' },
        successSub:       { fontSize: 15, color: colors.mutedForeground, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
        finishBtn:        { backgroundColor: colors.primaryGlow, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 10 },
        finishBtnText:    { fontSize: 15, fontWeight: '700', color: '#fff' },
    });
