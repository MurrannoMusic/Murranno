import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeColors } from '@/constants/theme';
import { appRedirect } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { FormError, FormField } from '@/components/forms/FormField';
import { friendlyError } from '@/components/states/StateViews';
import { email as emailRule } from '@/lib/validation';

export const ForgotPassword = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ email?: string }>();
    const { colors } = useTheme();
    const s = makeStyles(colors);
    const [email, setEmail] = useState(params.email ?? '');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; form?: string }>({});

    const handleReset = async () => {
        const emailError = emailRule(email);
        setErrors({ email: emailError || undefined });
        if (emailError) return;
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: appRedirect('reset-password') });
        setLoading(false);
        if (error) return setErrors({ form: friendlyError(error).message });
        router.push({ pathname: '/reset-password', params: { email: email.trim(), sent: '1' } } as any);
    };

    return (
        <View style={s.screen}>
            <Image source={require('@/assets/images/logo.png')} style={{ width: 160, height: 52, alignSelf: 'center', marginTop: 64 }} resizeMode="contain" />
            <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={s.back} onPress={() => router.back()}>
                        <ChevronLeft size={22} color={colors.foreground} />
                    </Pressable>
                    <View style={s.card}>
                        <Text accessibilityRole="header" style={s.title}>Forgot your password?</Text>
                        <Text style={s.subtitle}>
                            Enter the email linked to your account. We&apos;ll send a 6-digit code and a reset link so you can choose a new password.
                        </Text>
                        <FormField
                            label="Email"
                            placeholder="your@email.com"
                            value={email}
                            onChangeText={(v) => { setEmail(v); setErrors({}); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            textContentType="emailAddress"
                            returnKeyType="send"
                            onSubmitEditing={handleReset}
                            error={errors.email}
                            autoFocus
                        />
                        <FormError message={errors.form} />
                        <Pressable accessibilityRole="button" style={[s.submitBtn, loading && { opacity: 0.6 }]} onPress={handleReset} disabled={loading}>
                            {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.submitText}>Send reset code</Text>}
                        </Pressable>
                        <Pressable accessibilityRole="link" style={s.switchRow} onPress={() => router.replace('/sign-in' as any)}>
                            <Text style={s.switchText}>Remembered it? </Text>
                            <Text style={s.switchLink}>Sign in</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
    screen:  { flex: 1, backgroundColor: colors.background },
    flex:    { flex: 1 },
    scroll:  { flexGrow: 1, justifyContent: 'center', paddingBottom: 40 },
    back:    { padding: 20, paddingTop: 60, alignSelf: 'flex-start' },
    card:    { backgroundColor: colors.background, width: '100%', maxWidth: 520, alignSelf: 'center', padding: 24, gap: 14 },
    title:    { fontSize: 22, fontWeight: '600', color: colors.foreground },
    subtitle: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20 },
    submitBtn:  { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
    submitText: { fontSize: 16, fontWeight: '700', color: colors.onPrimary },
    switchRow:  { flexDirection: 'row', justifyContent: 'center', paddingVertical: 8 },
    switchText: { fontSize: 13, color: colors.mutedForeground },
    switchLink: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
