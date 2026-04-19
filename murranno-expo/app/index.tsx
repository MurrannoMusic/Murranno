import { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/integrations/supabase/client';

export default function Splash() {
    const router  = useRouter();
    const opacity = useRef(new Animated.Value(0)).current;
    const scale   = useRef(new Animated.Value(0.88)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Logo animates in first, tagline fades in slightly after
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(scale,   { toValue: 1, friction: 5,   useNativeDriver: true }),
        ]).start(() => {
            Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        });

        const check = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setTimeout(() => {
                router.replace(session ? '/app' : '/welcome');
            }, 2200);
        };
        check();
    }, [opacity, scale, taglineOpacity, router]);

    return (
        <View style={s.screen}>
            <Animated.View style={[s.logoWrap, { opacity, transform: [{ scale }] }]}>
                <Image
                    source={require('../assets/images/logo.png')}
                    style={s.logo}
                    resizeMode="contain"
                />
            </Animated.View>
            <Animated.Text style={[s.tagline, { opacity: taglineOpacity }]}>
                Distribute. Promote. Earn.
            </Animated.Text>
        </View>
    );
}

const s = StyleSheet.create({
    screen:   { flex: 1, backgroundColor: '#060c1f', alignItems: 'center', justifyContent: 'center', gap: 16 },
    logoWrap: { alignItems: 'center' },
    logo:     { width: 220, height: 100 },
    tagline:  { fontSize: 14, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, fontWeight: '500' },
});
