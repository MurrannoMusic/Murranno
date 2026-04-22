import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Pressable, Image,
    TextInput, ScrollView, ActivityIndicator,
    Alert, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '@/integrations/supabase/client';

const { width: W, height: H } = Dimensions.get('window');

export default function SignIn() {
    const router = useRouter();

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [showPw,   setShowPw]   = useState(false);
    const [loading,  setLoading]  = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing fields', 'Please enter your email and password.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        setLoading(false);
        if (error) {
            Alert.alert('Login failed', error.message);
        } else {
            router.replace('/app' as any);
        }
    };

    const handleOAuth = (provider: 'google' | 'apple') => {
        Alert.alert(
            `${provider === 'google' ? 'Google' : 'Apple'} Sign-In`,
            'OAuth sign-in requires additional native configuration. Please use email/password for now.',
        );
    };

    return (
        <View style={s.screen}>
            {/* Background image */}
            <Image
                source={require('../assets/images/onboarding-2.jpg')}
                style={s.bg}
                resizeMode="cover"
            />
            <View style={s.overlay} />

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
                        <ChevronLeft size={22} color="#fff" />
                    </Pressable>

                    {/* Card */}
                    <View style={s.card}>
                        <Text style={s.title}>Log in to your account</Text>

                        {/* OAuth */}
                        <Text style={s.orText}>OR CONTINUE WITH</Text>
                        <View style={s.oauthRow}>
                            <Pressable style={s.oauthBtn} onPress={() => handleOAuth('google')}>
                                <Text style={s.oauthBtnText}>G  Google</Text>
                            </Pressable>
                            <Pressable style={s.oauthBtn} onPress={() => handleOAuth('apple')}>
                                <Text style={s.oauthBtnText}> Apple</Text>
                            </Pressable>
                        </View>

                        {/* Fields */}
                        <Text style={s.label}>Email</Text>
                        <TextInput
                            style={s.input}
                            placeholderTextColor="rgba(255,255,255,0.35)"
                            placeholder="your@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <View style={s.pwRow}>
                            <Text style={s.label}>Password</Text>
                            <Pressable onPress={() => router.push('/forgot-password' as any)}>
                                <Text style={s.forgotText}>Forgot password?</Text>
                            </Pressable>
                        </View>
                        <View style={s.pwWrap}>
                            <TextInput
                                style={[s.input, { flex: 1, borderWidth: 0, paddingVertical: 0 }]}
                                placeholderTextColor="rgba(255,255,255,0.35)"
                                placeholder="••••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPw}
                            />
                            <Pressable onPress={() => setShowPw((p) => !p)} style={s.eyeBtn}>
                                {showPw
                                    ? <EyeOff size={18} color="rgba(255,255,255,0.4)" />
                                    : <Eye    size={18} color="rgba(255,255,255,0.4)" />
                                }
                            </Pressable>
                        </View>

                        {/* Submit */}
                        <Pressable
                            style={[s.submitBtn, loading && { opacity: 0.6 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={s.submitText}>Log In</Text>
                            }
                        </Pressable>

                        <Pressable style={s.switchRow} onPress={() => router.replace('/sign-up' as any)}>
                            <Text style={s.switchText}>Don't have an account? </Text>
                            <Text style={s.switchLink}>Sign up</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#060c1f' },
    flex:   { flex: 1 },
    bg:     { position: 'absolute', width: W, height: H },
    overlay:{ position: 'absolute', width: W, height: H, backgroundColor: 'rgba(6,12,31,0.72)' },

    scroll: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 40 },

    back: { padding: 20, paddingTop: 60, alignSelf: 'flex-start' },

    card: {
        backgroundColor: 'rgba(11,20,40,0.90)',
        marginHorizontal: 16, borderRadius: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        padding: 24, gap: 10,
    },

    title: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },

    orText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', textAlign: 'center', letterSpacing: 1.2 },
    oauthRow: { flexDirection: 'row', gap: 10 },
    oauthBtn: {
        flex: 1, paddingVertical: 11, borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
        alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
    },
    oauthBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

    label: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: -4 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 14, color: '#fff',
    },

    pwRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -4 },
    forgotText: { fontSize: 12, fontWeight: '600', color: '#9333ea' },
    pwWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 2,
    },
    eyeBtn: { padding: 8 },

    submitBtn: {
        backgroundColor: '#7c3aed', borderRadius: 14,
        paddingVertical: 15, alignItems: 'center', marginTop: 6,
        shadowColor: '#7c3aed', shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
    },
    submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },

    switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
    switchText:{ fontSize: 13, color: 'rgba(255,255,255,0.5)' },
    switchLink:{ fontSize: 13, fontWeight: '700', color: '#9333ea' },
});
