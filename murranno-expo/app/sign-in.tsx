import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Pressable, Image,
    TextInput, ScrollView, ActivityIndicator,
    Alert, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeColors } from '@/constants/theme';
import { appRedirect, signInWithProvider } from '@/lib/auth';
import { notify, invoke } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { FormError, FormField } from '@/components/forms/FormField';
import { friendlyError } from '@/components/states/StateViews';
import { email as emailRule } from '@/lib/validation';

const { width: W, height: H } = Dimensions.get('window');

export default function SignIn() {
    const router = useRouter();
    const { reason } = useLocalSearchParams<{ reason?: string }>();
    // Set after mount: the static web HTML has no query string, so rendering it directly breaks hydration.
    const [expired, setExpired] = useState(false);
    useEffect(() => setExpired(reason === 'expired'), [reason]);
    const { colors } = useTheme();
    const s = makeStyles(colors);

    const [providers, setProviders] = useState({google: false, apple: false});
    useEffect(() => { invoke('get-mobile-config').then(c => setProviders(c.providers)).catch(() => {}); }, []);
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [loading,  setLoading]  = useState(false);
    const [errors,   setErrors]   = useState<{ email?: string; password?: string; form?: string }>({});

    const handleLogin = async () => {
        const found = { email: emailRule(email) || undefined, password: password ? undefined : 'Enter your password' };
        setErrors(found);
        if (found.email || found.password) return;
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        setLoading(false);
        if (error) {
            const info = friendlyError(error);
            setErrors({ form: info.kind === 'offline' || info.kind === 'server' ? info.message : /invalid|credentials|password/i.test(error.message) ? 'That email and password don’t match. Check them or reset your password.' : error.message });
        } else {
            router.replace('/app' as any);
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
            {/* Background image */}
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
                        <Text accessibilityRole="header" style={s.title}>Log in to your account</Text>
                        {expired && (
                            <Text accessibilityRole="alert" style={s.notice}>Your session expired. Sign in again to continue.</Text>
                        )}

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

                        {/* Fields */}
                        <FormField
                            label="Email"
                            placeholder="your@email.com"
                            value={email}
                            onChangeText={(v) => { setEmail(v); setErrors({}); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            textContentType="emailAddress"
                            error={errors.email}
                        />

                        <View style={{ gap: 6 }}>
                            <View style={s.pwRow}>
                                <Text style={s.label}>Password</Text>
                                <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.push({ pathname: '/forgot-password', params: { email: email.trim() } } as any)}>
                                    <Text style={s.forgotText}>Forgot password?</Text>
                                </Pressable>
                            </View>
                            <FormField
                                password
                                accessibilityLabel="Password"
                                placeholder="••••••••••"
                                value={password}
                                onChangeText={(v) => { setPassword(v); setErrors({}); }}
                                autoComplete="current-password"
                                textContentType="password"
                                returnKeyType="go"
                                onSubmitEditing={handleLogin}
                                error={errors.password}
                            />
                        </View>

                        <FormError message={errors.form} />

                        {/* Submit */}
                        <Pressable
                            style={[s.submitBtn, loading && { opacity: 0.6 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color={colors.onPrimary} />
                                : <Text style={s.submitText}>Log In</Text>
                            }
                        </Pressable>

                        <Pressable style={s.switchRow} onPress={() => router.replace('/sign-up' as any)}>
                            <Text style={s.switchText}>Don&apos;t have an account? </Text>
                            <Text style={s.switchLink}>Sign up</Text>
                        </Pressable>
                    </View>
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

    scroll: { flexGrow: 1, justifyContent: 'center', paddingBottom: 40 },

    back: { padding: 20, paddingTop: 60, alignSelf: 'flex-start' },

    card: {
        backgroundColor: colors.background,
        width: '100%', maxWidth: 520, alignSelf: 'center', borderRadius: 0,
        padding: 24, gap: 14,
    },

    title: { fontSize: 22, fontWeight: '600', color: colors.foreground, marginBottom: 4 },

    orText: { fontSize: 11, fontWeight: '600', color: colors.mutedForeground, textAlign: 'center', letterSpacing: 1.2 },
    oauthRow: { flexDirection: 'row', gap: 10 },
    oauthBtn: {
        flex: 1, paddingVertical: 11, borderRadius: 12,
        borderWidth: 1, borderColor: colors.border,
        alignItems: 'center', backgroundColor: colors.input,
    },
    oauthBtnText: { fontSize: 13, fontWeight: '600', color: colors.foreground },

    label: { fontSize: 13, fontWeight: '600', color: colors.foreground },
    input: {
        backgroundColor: colors.input,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 14, color: colors.foreground,
    },

    pwRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    notice: { fontSize: 13, lineHeight: 18, color: colors.warning, backgroundColor: `${colors.warning}1a`, padding: 12, borderRadius: 10 },
    forgotText: { fontSize: 12, fontWeight: '600', color: colors.primary },
    pwWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.input,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 2,
    },
    eyeBtn: { padding: 8 },

    submitBtn: {
        backgroundColor: colors.primary, borderRadius: 10,
        paddingVertical: 15, alignItems: 'center', marginTop: 6,

    },
    submitText: { fontSize: 16, fontWeight: '700', color: colors.onPrimary },

    switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
    switchText:{ fontSize: 13, color: colors.mutedForeground },
    switchLink:{ fontSize: 13, fontWeight: '700', color: colors.primary },
});
