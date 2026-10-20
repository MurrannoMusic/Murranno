import React, { useEffect, useRef, useState } from 'react';
import { Text, Pressable, ScrollView, ActivityIndicator, Platform, View, KeyboardAvoidingView, TextInput } from 'react-native';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { acceptAuthUrl, appRedirect } from '@/lib/auth';
import { changeCredentials } from '@/lib/api';
import { FormError, FormField } from '@/components/forms/FormField';
import { EmptyState, SuccessState, friendlyError } from '@/components/states/StateViews';
import { email as emailRule, matches, password as passwordRule, validate } from '@/lib/validation';

const RESEND_COOLDOWN_S = 60;
type Fields = 'email' | 'code' | 'password' | 'confirmation';

/** Password strength 0–4 for the meter under the new-password field. */
const strength = (v: string) => [v.length >= 8, /[A-Z]/.test(v) && /[a-z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v) || v.length >= 12].filter(Boolean).length;
const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export default function ResetPassword() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; recovery?: string; sent?: string }>();
  const url = Linking.useURL();
  const [values, setValues] = useState<Record<Fields, string>>({ email: params.email || '', code: '', password: '', confirmation: '' });
  const [linked, setLinked] = useState(params.recovery === '1');
  const [linkExpired, setLinkExpired] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Fields | 'form', string>>>({});
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(params.sent === '1' ? RESEND_COOLDOWN_S : 0);
  const [notice, setNotice] = useState(params.sent === '1' ? `We sent a 6-digit code to ${params.email}. It expires in 1 hour.` : '');
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  useEffect(() => {
    const value = Platform.OS === 'web' ? window.location.href : url;
    if (value?.includes('access_token=')) acceptAuthUrl(value).then((type) => { if (type === 'recovery') setLinked(true); }).catch(() => setLinkExpired(true));
    else if (value?.includes('error_code=otp_expired') || value?.includes('error=access_denied')) setLinkExpired(true);
  }, [url]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const set = (field: Fields) => (v: string) => { setValues((p) => ({ ...p, [field]: field === 'code' ? v.replace(/\D/g, '').slice(0, 6) : v })); setErrors({}); };

  const save = async () => {
    const found = validate(values, {
      ...(linked ? {} : { email: [emailRule], code: [(v: string) => (/^\d{6}$/.test(v) ? '' : 'Enter the 6-digit code from your email')] }),
      password: [passwordRule],
      confirmation: [(v: string) => (v ? '' : 'Re-enter your new password'), matches(values.password)],
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      if (!linked) {
        const { error } = await supabase.auth.verifyOtp({ email: values.email.trim(), token: values.code, type: 'recovery' });
        if (error) { setErrors({ code: 'That code is wrong or has expired. Check your email or send a new one.' }); return; }
        setLinked(true);
      }
      await changeCredentials({ password: values.password });
      await supabase.auth.signOut({ scope: 'local' });
      setDone(true);
    } catch (e) {
      setErrors({ form: friendlyError(e).message });
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    const emailError = emailRule(values.email);
    if (emailError) return setErrors({ email: emailError });
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), { redirectTo: appRedirect('reset-password') });
    setBusy(false);
    if (error) return setErrors({ form: friendlyError(error).message });
    setErrors({});
    setLinkExpired(false);
    setNotice(`We sent a new code to ${values.email.trim()}.`);
    setCooldown(RESEND_COOLDOWN_S);
  };

  const score = strength(values.password);
  const meterColor = score <= 1 ? colors.destructive : score === 2 ? colors.warning : colors.success;

  const container = { flexGrow: 1, justifyContent: 'center' as const, width: '100%' as const, maxWidth: 520, alignSelf: 'center' as const, padding: 24, gap: 16 };

  if (done) {
    return (
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={container}>
        <SuccessState title="Password updated" body="You can now sign in with your new password." action={{ label: 'Continue to sign in', onPress: () => router.replace('/sign-in' as any) }} />
      </ScrollView>
    );
  }

  if (linkExpired) {
    return (
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={container}>
        <EmptyState title="This reset link has expired" body="Reset links work once and expire after an hour. Request a new one to continue."
          action={{ label: 'Send a new link', onPress: () => router.replace({ pathname: '/forgot-password', params: { email: values.email } } as any) }}
          secondary={{ label: 'Back to sign in', onPress: () => router.replace('/sign-in' as any) }} />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={container} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={{ color: colors.foreground, fontSize: 28, fontWeight: '600' }}>
          {linked ? 'Choose a new password' : 'Check your email'}
        </Text>
        <Text style={{ color: colors.mutedForeground, lineHeight: 22 }}>
          {linked ? 'Your reset link is verified. Pick a password you haven’t used here before.' : notice || 'Enter the 6-digit code we emailed you, then choose a new password.'}
        </Text>

        {!linked && (
          <>
            {!params.email && (
              <FormField label="Email" value={values.email} onChangeText={set('email')} placeholder="your@email.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" error={errors.email} />
            )}
            <FormField
              label="6-digit code"
              value={values.code}
              onChangeText={set('code')}
              placeholder="123456"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              style={{ letterSpacing: 6, fontSize: 18 }}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={errors.code}
            />
          </>
        )}

        <View style={{ gap: 8 }}>
          <FormField
            ref={passwordRef}
            password
            label="New password"
            value={values.password}
            onChangeText={set('password')}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            error={errors.password}
            hint="Use 8+ characters with letters and numbers."
          />
          {!!values.password && (
            <View accessibilityLabel={`Password strength: ${STRENGTH_LABEL[score]}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
                {[0, 1, 2, 3].map((i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < score ? meterColor : colors.border }} />)}
              </View>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, width: 64, textAlign: 'right' }}>{STRENGTH_LABEL[score]}</Text>
            </View>
          )}
        </View>
        <FormField
          ref={confirmRef}
          password
          label="Confirm new password"
          value={values.confirmation}
          onChangeText={set('confirmation')}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={save}
          error={errors.confirmation}
        />

        <FormError message={errors.form} />
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={save}
          style={{ backgroundColor: colors.primary, borderRadius: 10, minHeight: 50, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}
        >
          {busy ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 16 }}>Update password</Text>}
        </Pressable>

        {!linked && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <Pressable accessibilityRole="button" disabled={busy || cooldown > 0} onPress={resend} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text style={{ color: cooldown > 0 ? colors.mutedForeground : colors.primary, fontWeight: '600' }}>
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.replace('/forgot-password' as any)} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text style={{ color: colors.mutedForeground }}>Use a different email</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
