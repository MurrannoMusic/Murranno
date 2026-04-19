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

export default function SignUp() {
    const router = useRouter();

    const [firstName,  setFirstName]  = useState('');
    const [lastName,   setLastName]   = useState('');
    const [phone,      setPhone]      = useState('');
    const [email,      setEmail]      = useState('');
    const [password,   setPassword]   = useState('');
    const [confirmPw,  setConfirmPw]  = useState('');
    const [showPw,     setShowPw]     = useState(false);
    const [showCPw,    setShowCPw]    = useState(false);
    const [loading,    setLoading]    = useState(false);

    const handleSignUp = async () => {
        if (!firstName || !email || !password || !confirmPw) {
            Alert.alert('Missing fields', 'Please fill in all required fields.');
            return;
        }
        if (password !== confirmPw) {
            Alert.alert('Password mismatch', 'Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Weak password', 'Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                    first_name: firstName.trim(),
                    last_name:  lastName.trim(),
                    phone:      phone.trim(),
                },
            },
        });
        setLoading(false);
        if (error) {
            Alert.alert('Sign up failed', error.message);
            return;
        }
        if (data.session) {
            router.replace('/app' as any);
        } else {
            Alert.alert(
                'Verify your email',
                'A confirmation link has been sent to your email. Please verify before logging in.',
                [{ text: 'OK', onPress: () => router.replace('/sign-in' as any) }],
            );
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
            {/* Background */}
            <Image
                source={require('../assets/images/onboarding-1.jpg')}
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
                        <Text style={s.title}>Join Murranno Music</Text>

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

                        {/* Name row */}
                        <View style={s.nameRow}>
                            <View style={s.nameField}>
                                <Text style={s.label}>First Name</Text>
                                <TextInput
                                    style={s.input}
                                    placeholder="John"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </View>
                            <View style={s.nameField}>
                                <Text style={s.label}>Last Name</Text>
                                <TextInput
                                    style={s.input}
                                    placeholder="Doe"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>
                        </View>

                        {/* Phone */}
                        <Text style={s.label}>Phone Number</Text>
                        <TextInput
                            style={s.input}
                            placeholder="+234..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />

                        {/* Email */}
                        <Text style={s.label}>Email</Text>
                        <TextInput
                            style={s.input}
                            placeholder="murrannomusic@gmail.com"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* Password */}
                        <Text style={s.label}>Password</Text>
                        <View style={s.pwWrap}>
                            <TextInput
                                style={s.pwInput}
                                placeholder="••••••••••"
                                placeholderTextColor="rgba(255,255,255,0.3)"
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

                        {/* Confirm Password */}
                        <Text style={s.label}>Confirm Password</Text>
                        <View style={s.pwWrap}>
                            <TextInput
                                style={s.pwInput}
                                placeholder="Confirm your password"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={confirmPw}
                                onChangeText={setConfirmPw}
                                secureTextEntry={!showCPw}
                            />
                            <Pressable onPress={() => setShowCPw((p) => !p)} style={s.eyeBtn}>
                                {showCPw
                                    ? <EyeOff size={18} color="rgba(255,255,255,0.4)" />
                                    : <Eye    size={18} color="rgba(255,255,255,0.4)" />
                                }
                            </Pressable>
                        </View>

                        {/* Submit */}
                        <Pressable
                            style={[s.submitBtn, loading && { opacity: 0.6 }]}
                            onPress={handleSignUp}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
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

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#060c1f' },
    flex:   { flex: 1 },
    bg:     { position: 'absolute', width: W, height: H },
    overlay:{ position: 'absolute', width: W, height: H, backgroundColor: 'rgba(6,12,31,0.72)' },

    scroll: { flexGrow: 1, paddingBottom: 24 },

    back: { padding: 20, paddingTop: 60, alignSelf: 'flex-start' },

    card: {
        backgroundColor: 'rgba(11,20,40,0.90)',
        marginHorizontal: 16, borderRadius: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        padding: 24, gap: 10,
    },

    title: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },

    orText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', textAlign: 'center', letterSpacing: 1.2 },
    oauthRow:  { flexDirection: 'row', gap: 10 },
    oauthBtn:  {
        flex: 1, paddingVertical: 11, borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
        alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
    },
    oauthBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

    nameRow:   { flexDirection: 'row', gap: 10 },
    nameField: { flex: 1, gap: 6 },

    label: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
    input: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
        fontSize: 14, color: '#fff',
    },

    pwWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 2,
    },
    pwInput: { flex: 1, fontSize: 14, color: '#fff', paddingVertical: 9 },
    eyeBtn:  { padding: 8 },

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
