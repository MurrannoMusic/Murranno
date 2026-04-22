import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Pressable, Image,
    TextInput, ScrollView, ActivityIndicator,
    Alert, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { supabase } from '@/integrations/supabase/client';

const { width: W, height: H } = Dimensions.get('window');

export const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async () => {
        if (!email.trim()) {
            Alert.alert('Required', 'Please enter your email address.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: 'murranno://reset-password',
        });
        setLoading(false);
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setSent(true);
        }
    };

    return (
        <View style={s.screen}>
            <Image
                source={require('../assets/images/onboarding-2.jpg')}
                style={s.bg}
                resizeMode="cover"
            />
            <View style={s.overlay} />
            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={s.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Pressable style={s.back} onPress={() => router.back()}>
                        <ChevronLeft size={22} color="#fff" />
                    </Pressable>
                    <View style={s.card}>
                        {sent ? (
                            <>
                                <Text style={s.title}>Check your inbox</Text>
                                <Text style={s.subtitle}>
                                    We've sent a password reset link to {email}. Open the link to choose a new password.
                                </Text>
                                <Pressable style={s.submitBtn} onPress={() => router.replace('/sign-in' as any)}>
                                    <Text style={s.submitText}>Back to Login</Text>
                                </Pressable>
                            </>
                        ) : (
                            <>
                                <Text style={s.title}>Reset your password</Text>
                                <Text style={s.subtitle}>
                                    Enter the email address linked to your account and we'll send you a reset link.
                                </Text>
                                <Text style={s.label}>Email</Text>
                                <TextInput
                                    style={s.input}
                                    placeholderTextColor="rgba(255,255,255,0.35)"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoFocus
                                />
                                <Pressable
                                    style={[s.submitBtn, loading && { opacity: 0.6 }]}
                                    onPress={handleReset}
                                    disabled={loading}
                                >
                                    {loading
                                        ? <ActivityIndicator color="#fff" />
                                        : <Text style={s.submitText}>Send Reset Link</Text>
                                    }
                                </Pressable>
                                <Pressable style={s.switchRow} onPress={() => router.back()}>
                                    <Text style={s.switchText}>Remembered it? </Text>
                                    <Text style={s.switchLink}>Sign in</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const s = StyleSheet.create({
    screen:  { flex: 1, backgroundColor: '#060c1f' },
    flex:    { flex: 1 },
    bg:      { position: 'absolute', width: W, height: H },
    overlay: { position: 'absolute', width: W, height: H, backgroundColor: 'rgba(6,12,31,0.72)' },
    scroll:  { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 40 },
    back:    { padding: 20, paddingTop: 60, alignSelf: 'flex-start' },
    card: {
        backgroundColor: 'rgba(11,20,40,0.90)',
        marginHorizontal: 16, borderRadius: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        padding: 24, gap: 12,
    },
    title:    { fontSize: 22, fontWeight: '800', color: '#fff' },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 20 },
    label:    { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: -4 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 14, color: '#fff',
    },
    submitBtn: {
        backgroundColor: '#7c3aed', borderRadius: 14,
        paddingVertical: 15, alignItems: 'center', marginTop: 6,
        shadowColor: '#7c3aed', shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
    },
    submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    switchRow:  { flexDirection: 'row', justifyContent: 'center' },
    switchText: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
    switchLink: { fontSize: 13, fontWeight: '700', color: '#9333ea' },
});
