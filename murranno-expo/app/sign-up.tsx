import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Pressable, Image,
    TextInput, ScrollView, ActivityIndicator,
    Alert, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeColors } from '@/constants/theme';
import { appRedirect, signInWithProvider } from '@/lib/auth';
import { notify, invoke } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { FormError, FormField } from '@/components/forms/FormField';
import { friendlyError } from '@/components/states/StateViews';
import { email as emailRule, matches, ngPhone, password as passwordRule, required, validate } from '@/lib/validation';

const { width: W, height: H } = Dimensions.get('window');

export default function SignUp() {
    const router = useRouter();
    const { colors } = useTheme();
    const s = makeStyles(colors);

    const [firstName,  setFirstName]  = useState('');
    const [lastName,   setLastName]   = useState('');
    const [phone,      setPhone]      = useState('');
    const [providers, setProviders] = useState({google: false, apple: false});
    useEffect(() => { invoke('get-mobile-config').then(c => setProviders(c.providers)).catch(() => {}); }, []);
    const [email,      setEmail]      = useState('');
    const [password,   setPassword]   = useState('');
    const [confirmPw,  setConfirmPw]  = useState('');
    const [loading,    setLoading]    = useState(false);
    const [errors,     setErrors]     = useState<Partial<Record<'firstName' | 'lastName' | 'phone' | 'email' | 'password' | 'confirmPw' | 'form', string>>>({});
    const clear = (fn: (v: string) => void) => (v: string) => { fn(v); setErrors({}); };

    const handleSignUp = async () => {
        const found = validate({ firstName, lastName, phone, email, password, confirmPw }, {
            firstName: [required('your first name')],
            lastName:  [required('your last name')],
            phone:     [required('your phone number'), ngPhone],
            email:     [emailRule],
            password:  [passwordRule],
            confirmPw: [(v) => (v ? '' : 'Re-enter your password'), matches(password)],
        });
        setErrors(found);
        if (Object.keys(found).length) return;
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                emailRedirectTo: appRedirect('auth/callback'),
                data: {
                    first_name: firstName.trim(),
                    last_name:  lastName.trim(),
                    phone:      phone.trim(),
                },
            },
        });
        setLoading(false);
        if (error) {
            const info = friendlyError(error);
            if (/already|registered|exists/i.test(error.message)) setErrors({ email: 'An account with this email already exists. Log in instead.' });
            else setErrors({ form: info.kind === 'unknown' || info.kind === 'validation' ? error.message : info.message });
            return;
        }
        if (data.session) {
            router.replace('/app' as any);
        } else {
            router.replace({ pathname: '/verify-email', params: { email: email.trim() } } as any);
        }
    };

    const handleOAuth = async (provider: 'google' | 'apple') => {
        if (loading) return;
        setLoading(true);
        try { if (await signInWithProvider(provider)) router.replace('/app'); }
        catch (error: any) { notify('Sign-in unavailable', error.message); }
        finally { setLoading(false); }
    };

    return (
        <View style={s.screen}>
            {/* Background */}
            <Image source={require('@/assets/images/logo.png')} style={{ width: 160, height: 52, alignSelf: 'center', marginTop: 64 }} resizeMode="contain" />

            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    contentContainerStyle={s.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back */}
                    <Pressable style={s.back} onPress={() => router.back()}>
                        <ChevronLeft size={22} color={colors.foreground} />
                    </Pressable>

                    {/* Card */}
                    <View style={s.card}>
                        <Text accessibilityRole="header" style={s.title}>Join Murranno Music</Text>

                        {/* OAuth */}
                        <Text style={s.orText}>OR CONTINUE WITH</Text>
                        <View style={s.oauthRow}>
                            <Pressable accessibilityRole="button" disabled={loading || !providers.google} style={[s.oauthBtn, !providers.google && {opacity: 0.4}]} onPress={() => handleOAuth('google')}>
                                <Text style={s.oauthBtnText}>G  Google</Text>
                            </Pressable>
                            <Pressable accessibilityRole="button" disabled={loading || !providers.apple} style={[s.oauthBtn, !providers.apple && {opacity: 0.4}]} onPress={() => handleOAuth('apple')}>
                                <Text style={s.oauthBtnText}> Apple</Text>
                            </Pressable>
                        </View>

                        {/* Name row */}
                        <View style={s.nameRow}>
                            <FormField containerStyle={s.nameField} label="First name" placeholder="John" value={firstName} onChangeText={clear(setFirstName)} autoComplete="given-name" textContentType="givenName" error={errors.firstName} />
                            <FormField containerStyle={s.nameField} label="Last name" placeholder="Doe" value={lastName} onChangeText={clear(setLastName)} autoComplete="family-name" textContentType="familyName" error={errors.lastName} />
                        </View>

                        <FormField label="Phone number" placeholder="0803 123 4567" value={phone} onChangeText={clear(setPhone)} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" error={errors.phone} />

                        <FormField label="Email" placeholder="you@example.com" value={email} onChangeText={clear(setEmail)} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" error={errors.email} />

                        <FormField password label="Password" placeholder="At least 8 characters" value={password} onChangeText={clear(setPassword)} autoComplete="new-password" textContentType="newPassword" error={errors.password} hint="Use 8+ characters with letters and numbers." />

                        <FormField password label="Confirm password" placeholder="Re-enter your password" value={confirmPw} onChangeText={clear(setConfirmPw)} autoComplete="new-password" textContentType="newPassword" returnKeyType="go" onSubmitEditing={handleSignUp} error={errors.confirmPw} />

                        <FormError message={errors.form} />

                        {/* Submit */}
                        <Pressable
                            style={[s.submitBtn, loading && { opacity: 0.6 }]}
                            onPress={handleSignUp}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color={colors.onPrimary} />
                                : <Text style={s.submitText}>Create Account</Text>
                            }
                        </Pressable>

                        <Pressable style={s.switchRow} onPress={() => router.replace('/sign-in' as any)}>
                            <Text style={s.switchText}>Already have an account? </Text>
                            <Text style={s.switchLink}>Log in</Text>
                        </Pressable>
                    </View>

                    <View style={{ height: 32 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    flex:   { flex: 1 },
    bg:     { position: 'absolute', width: W, height: H },
    overlay:{ position: 'absolute', width: W, height: H, backgroundColor: 'rgba(6,12,31,0.72)' },

    scroll: { flexGrow: 1, paddingBottom: 24 },

    back: { padding: 20, paddingTop: 60, alignSelf: 'flex-start' },

    card: {
        backgroundColor: colors.background,
        width: '100%', maxWidth: 520, alignSelf: 'center', borderRadius: 0,
        padding: 24, gap: 14,
    },

    title: { fontSize: 22, fontWeight: '600', color: colors.foreground, marginBottom: 4 },

    orText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground, textAlign: 'center', letterSpacing: 1.2 },
    oauthRow:  { flexDirection: 'row', gap: 10 },
    oauthBtn:  {
        flex: 1, paddingVertical: 11, borderRadius: 12,
        borderWidth: 1, borderColor: colors.border,
        alignItems: 'center', backgroundColor: colors.input,
    },
    oauthBtnText: { fontSize: 13, fontWeight: '600', color: colors.foreground },

    nameRow:   { flexDirection: 'row', gap: 10 },
    nameField: { flex: 1 },

    label: { fontSize: 13, fontWeight: '600', color: colors.foreground },
    input: {
        backgroundColor: colors.input,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
        fontSize: 14, color: colors.foreground,
    },

    pwWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.input,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 2,
    },
    pwInput: { flex: 1, fontSize: 14, color: colors.foreground, paddingVertical: 9 },
    eyeBtn:  { padding: 8 },

    submitBtn: {
        backgroundColor: colors.primary, borderRadius: 10,
        paddingVertical: 15, alignItems: 'center', marginTop: 6,

    },
    submitText: { fontSize: 16, fontWeight: '700', color: colors.onPrimary },

    switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
    switchText:{ fontSize: 13, color: colors.mutedForeground },
    switchLink:{ fontSize: 13, fontWeight: '700', color: colors.primary },
});
