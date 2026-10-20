import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wifi, WifiOff, Clock } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { dismissSessionExpired, useAppStatus } from '@/lib/appStatus';

const BACK_ONLINE_MS = 2500;
const AUTH_SCREENS = ['sign-in', 'sign-up', 'welcome', 'forgot-password', 'reset-password', 'verify-email', 'auth'];

/** Offline / slow-connection banner, a short "back online" note, and the session-expired prompt. */
export function NetworkStatus() {
  const { online, slow, sessionExpired } = useAppStatus();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const [backOnline, setBackOnline] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) { wasOffline.current = true; return; }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    setBackOnline(true);
    const t = setTimeout(() => setBackOnline(false), BACK_ONLINE_MS);
    return () => clearTimeout(t);
  }, [online]);

  const onAuthScreen = AUTH_SCREENS.includes(String(segments[0] ?? ''));
  const banner = !online
    ? { icon: WifiOff, text: 'You’re offline. Some things won’t load until you reconnect.', bg: colors.destructive }
    : slow
      ? { icon: Clock, text: 'Slow connection. This may take a little longer…', bg: colors.warning }
      : backOnline
        ? { icon: Wifi, text: 'You’re back online', bg: colors.success }
        : null;

  return (
    <>
      {banner && (
        <View pointerEvents="none" accessibilityRole="alert" accessibilityLiveRegion="polite" style={[s.banner, { backgroundColor: banner.bg, paddingTop: insets.top + 6 }]}>
          {slow && online ? <ActivityIndicator size="small" color="#fff" /> : <banner.icon size={15} color="#fff" />}
          <Text style={s.bannerText}>{banner.text}</Text>
        </View>
      )}
      <Modal transparent animationType="fade" visible={sessionExpired && !onAuthScreen} onRequestClose={dismissSessionExpired}>
        <View style={s.backdrop}>
          <View style={[s.dialog, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.title, { color: colors.foreground }]}>Your session expired</Text>
            <Text style={[s.body, { color: colors.mutedForeground }]}>For your security you were signed out. Sign in again to pick up where you left off.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => { dismissSessionExpired(); router.replace('/sign-in?reason=expired' as any); }}
              style={[s.btn, { backgroundColor: colors.primary }]}
            >
              <Text style={[s.btnText, { color: colors.onPrimary }]}>Sign in again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  banner: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  bannerText: { color: '#fff', fontSize: 13, fontWeight: '600', flexShrink: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 380, borderRadius: 18, borderWidth: 1, padding: 22, gap: 10 },
  title: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20 },
  btn: { marginTop: 8, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '700' },
});
