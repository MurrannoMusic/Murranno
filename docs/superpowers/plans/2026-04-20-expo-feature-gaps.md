# Murranno Expo — Feature Gap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the six highest-priority feature gaps between `murranno-expo` (mobile) and `murranno-music/frontend` (web), excluding the admin suite.

**Architecture:** All new screens follow the existing pattern — a route file in `app/` that re-exports a page component from `pages/`, with data fetched via a custom hook in `hooks/`. Styling uses `useTheme()` + `StyleSheet.create()`. New dynamic routes go in nested folders under `app/app/`.

**Tech Stack:** Expo 55 · Expo Router · React Native · Supabase Edge Functions · Lucide React Native · `expo-av` (new dep for audio) · existing `useTheme` color system

---

## File Map

### New files

| File | Purpose |
|---|---|
| `murranno-expo/app/forgot-password.tsx` | Route wrapper for Forgot Password screen |
| `murranno-expo/pages/ForgotPassword.tsx` | Forgot Password UI + Supabase reset email call |
| `murranno-expo/app/app/releases/[id].tsx` | Dynamic route for Release Detail |
| `murranno-expo/hooks/useReleaseDetail.ts` | Fetch single release via `get-release-detail` edge function |
| `murranno-expo/pages/ReleaseDetail.tsx` | Release Detail page (cover, tracks list, metadata, stats) |
| `murranno-expo/components/ui/AudioPlayer.tsx` | Reusable mini audio player using `expo-av` |
| `murranno-expo/app/app/campaigns.tsx` | Route wrapper for Campaign Manager |
| `murranno-expo/pages/CampaignManager.tsx` | Campaign list, filter chips, stats summary |
| `murranno-expo/app/app/campaigns/[id].tsx` | Dynamic route for Campaign Detail |
| `murranno-expo/pages/CampaignDetail.tsx` | Campaign detail: status, budget, reach, target audience |
| `murranno-expo/app/app/subscriptions.tsx` | Route wrapper for Subscription Plans |
| `murranno-expo/hooks/useSubscriptions.ts` | Fetch plans + current user subscription |
| `murranno-expo/pages/SubscriptionPlans.tsx` | Plan cards with current plan highlight |

### Modified files

| File | Change |
|---|---|
| `murranno-expo/app/sign-in.tsx` | Wire "Forgot password?" link to `/forgot-password` route |
| `murranno-expo/app/app/_layout.tsx` | Register `campaigns`, `campaigns/[id]`, `subscriptions` as hidden screens |
| `murranno-expo/pages/ReleaseDetail.tsx` | Embeds `AudioPlayer` component per track |

---

## Task 1: Forgot Password screen

**Files:**
- Create: `murranno-expo/app/forgot-password.tsx`
- Create: `murranno-expo/pages/ForgotPassword.tsx`
- Modify: `murranno-expo/app/sign-in.tsx` line 97

- [ ] **Step 1: Create the page component**

```tsx
// murranno-expo/pages/ForgotPassword.tsx
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
```

- [ ] **Step 2: Create the route wrapper**

```tsx
// murranno-expo/app/forgot-password.tsx
import { ForgotPassword } from '@/pages/ForgotPassword';
export default function ForgotPasswordRoute() {
    return <ForgotPassword />;
}
```

- [ ] **Step 3: Wire the "Forgot password?" link in sign-in.tsx**

In `murranno-expo/app/sign-in.tsx` at line 97, replace:
```tsx
<Pressable onPress={() => Alert.alert('Reset Password', 'Check your email for a reset link.')}>
```
with:
```tsx
<Pressable onPress={() => router.push('/forgot-password' as any)}>
```

- [ ] **Step 4: Commit**
```bash
git add murranno-expo/app/forgot-password.tsx murranno-expo/pages/ForgotPassword.tsx murranno-expo/app/sign-in.tsx
git commit -m "feat(expo): add forgot password screen"
```

---

## Task 2: Release Detail — hook

**Files:**
- Create: `murranno-expo/hooks/useReleaseDetail.ts`

- [ ] **Step 1: Create the hook**

```ts
// murranno-expo/hooks/useReleaseDetail.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Track {
    id: string;
    title: string;
    duration: number;
    track_number: number;
    isrc: string | null;
    streams: number;
    audio_url?: string | null;
}

export interface ReleaseDetail {
    id: string;
    title: string;
    artist_name: string;
    release_type: string;
    release_date: string;
    cover_art_url: string | null;
    status: string;
    genre: string | null;
    language: string | null;
    label: string | null;
    copyright: string | null;
    upc_ean: string | null;
    isrc: string | null;
    recording_year: string | null;
    smartlink: string | null;
    tracks: Track[];
    total_streams: number;
    total_earnings: number;
}

export const useReleaseDetail = (releaseId: string | undefined) => {
    const [release, setRelease] = useState<ReleaseDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (releaseId) fetchDetail();
    }, [releaseId]);

    const fetchDetail = async () => {
        if (!releaseId) return;
        try {
            setLoading(true);
            const { data, error } = await supabase.functions.invoke('get-release-detail', {
                body: { releaseId },
            });
            if (error) throw error;
            if (data?.success) setRelease(data.release);
        } catch (err) {
            console.error('useReleaseDetail error:', err);
        } finally {
            setLoading(false);
        }
    };

    return { release, loading, refetch: fetchDetail };
};
```

- [ ] **Step 2: Commit**
```bash
git add murranno-expo/hooks/useReleaseDetail.ts
git commit -m "feat(expo): add useReleaseDetail hook"
```

---

## Task 3: Audio Player component

**Files:**
- Create: `murranno-expo/components/ui/AudioPlayer.tsx`

- [ ] **Step 1: Install expo-av**
```bash
cd murranno-expo && npx expo install expo-av
```
Expected: package added to package.json, no errors.

- [ ] **Step 2: Create the AudioPlayer component**

```tsx
// murranno-expo/components/ui/AudioPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause, Square } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

interface AudioPlayerProps {
    uri: string;
    title: string;
    duration?: number;
}

export const AudioPlayer = ({ uri, title, duration }: AudioPlayerProps) => {
    const { colors } = useTheme();
    const soundRef = useRef<Audio.Sound | null>(null);
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [positionSec, setPositionSec] = useState(0);
    const [durationSec, setDurationSec] = useState(duration ?? 0);

    useEffect(() => {
        Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        return () => {
            soundRef.current?.unloadAsync();
        };
    }, []);

    const togglePlay = async () => {
        if (loading) return;
        if (!soundRef.current) {
            setLoading(true);
            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true },
                (status) => {
                    if (!status.isLoaded) return;
                    setPositionSec(status.positionMillis / 1000);
                    setDurationSec(status.durationMillis ? status.durationMillis / 1000 : 0);
                    if (status.didJustFinish) {
                        setPlaying(false);
                        setPositionSec(0);
                    }
                },
            );
            soundRef.current = sound;
            setPlaying(true);
            setLoading(false);
            return;
        }
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) return;
        if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setPlaying(false);
        } else {
            await soundRef.current.playAsync();
            setPlaying(true);
        }
    };

    const handleStop = async () => {
        if (!soundRef.current) return;
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlaying(false);
        setPositionSec(0);
    };

    const progress = durationSec > 0 ? positionSec / durationSec : 0;

    return (
        <View style={[s.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable style={[s.playBtn, { backgroundColor: colors.primaryGlow }]} onPress={togglePlay}>
                {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : playing
                        ? <Pause size={16} color="#fff" />
                        : <Play size={16} color="#fff" />
                }
            </Pressable>
            <View style={s.info}>
                <Text style={[s.title, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
                <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
                    <View style={[s.progressFill, { width: `${progress * 100}%` as any, backgroundColor: colors.primaryGlow }]} />
                </View>
                <Text style={[s.time, { color: colors.mutedForeground }]}>
                    {formatDuration(positionSec)} / {formatDuration(durationSec)}
                </Text>
            </View>
            {playing && (
                <Pressable style={s.stopBtn} onPress={handleStop}>
                    <Square size={14} color={colors.mutedForeground} />
                </Pressable>
            )}
        </View>
    );
};

const s = StyleSheet.create({
    container: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderRadius: 12, borderWidth: 1, padding: 10,
    },
    playBtn: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    info:         { flex: 1, gap: 4 },
    title:        { fontSize: 13, fontWeight: '600' },
    progressTrack:{ height: 3, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    time:         { fontSize: 10 },
    stopBtn:      { padding: 6 },
});
```

- [ ] **Step 3: Commit**
```bash
git add murranno-expo/components/ui/AudioPlayer.tsx murranno-expo/package.json
git commit -m "feat(expo): add AudioPlayer component with expo-av"
```

---

## Task 4: Release Detail page + route

**Files:**
- Create: `murranno-expo/pages/ReleaseDetail.tsx`
- Create: `murranno-expo/app/app/releases/[id].tsx`

- [ ] **Step 1: Create the page component**

```tsx
// murranno-expo/pages/ReleaseDetail.tsx
import React, { useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Music, Share2, TrendingUp, DollarSign } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useReleaseDetail } from '@/hooks/useReleaseDetail';
import { AudioPlayer } from '@/components/ui/AudioPlayer';

const STATUS_COLOR: Record<string, string> = {
    Live:      '#22c55e',
    Published: '#22c55e',
    Draft:     '#6b7280',
    Repair:    '#f59e0b',
    Takedown:  '#ef4444',
};

const formatNumber = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
};

const MetaRow = ({ label, value, colors }: { label: string; value: string | null | undefined; colors: any }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, maxWidth: '55%', textAlign: 'right' }}>
            {value || '—'}
        </Text>
    </View>
);

export const ReleaseDetailPage = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { release, loading } = useReleaseDetail(id);

    if (loading) {
        return (
            <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={colors.primaryGlow} size="large" />
            </View>
        );
    }

    if (!release) {
        return (
            <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.mutedForeground }}>Release not found.</Text>
                <Pressable style={s.backBtnAlt} onPress={() => router.back()}>
                    <Text style={{ color: colors.primaryGlow, fontWeight: '700' }}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    const statusColor = STATUS_COLOR[release.status] ?? '#9333ea';

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={s.header}>
                <Pressable style={s.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={22} color={colors.foreground} />
                </Pressable>
                <Text style={s.headerTitle} numberOfLines={1}>Release Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero */}
                <View style={s.hero}>
                    {release.cover_art_url ? (
                        <Image source={{ uri: release.cover_art_url }} style={s.coverArt} resizeMode="cover" />
                    ) : (
                        <View style={[s.coverArt, s.coverPlaceholder]}>
                            <Music size={48} color={colors.mutedForeground} />
                        </View>
                    )}
                    <View style={s.heroInfo}>
                        <Text style={s.releaseTitle} numberOfLines={2}>{release.title}</Text>
                        <Text style={s.artistName}>{release.artist_name}</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                            <View style={[s.badge, { backgroundColor: statusColor }]}>
                                <Text style={s.badgeText}>{release.status}</Text>
                            </View>
                            <View style={[s.badge, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                                <Text style={[s.badgeText, { color: colors.foreground }]}>{release.release_type?.toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats row */}
                <View style={s.statsRow}>
                    <View style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TrendingUp size={18} color={colors.primaryGlow} />
                        <Text style={[s.statValue, { color: colors.foreground }]}>{formatNumber(release.total_streams)}</Text>
                        <Text style={[s.statLabel, { color: colors.mutedForeground }]}>Streams</Text>
                    </View>
                    <View style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <DollarSign size={18} color='#22c55e' />
                        <Text style={[s.statValue, { color: colors.foreground }]}>₦{formatNumber(release.total_earnings)}</Text>
                        <Text style={[s.statLabel, { color: colors.mutedForeground }]}>Earnings</Text>
                    </View>
                </View>

                {/* Tracks */}
                {release.tracks.length > 0 && (
                    <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Tracks ({release.tracks.length})</Text>
                        {release.tracks
                            .sort((a, b) => a.track_number - b.track_number)
                            .map((track) => (
                                <View key={track.id} style={s.trackItem}>
                                    {track.audio_url ? (
                                        <AudioPlayer uri={track.audio_url} title={`${track.track_number}. ${track.title}`} duration={track.duration} />
                                    ) : (
                                        <View style={[s.trackRow, { borderBottomColor: colors.border }]}>
                                            <Text style={[s.trackNum, { color: colors.mutedForeground }]}>{track.track_number}</Text>
                                            <Text style={[s.trackTitle, { color: colors.foreground }]} numberOfLines={1}>{track.title}</Text>
                                            <Text style={[s.trackStreams, { color: colors.mutedForeground }]}>{formatNumber(track.streams)} streams</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                    </View>
                )}

                {/* Metadata */}
                <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[s.sectionTitle, { color: colors.foreground }]}>Details</Text>
                    <MetaRow label="Release Date" value={release.release_date ? new Date(release.release_date).toLocaleDateString() : null} colors={colors} />
                    <MetaRow label="Genre"         value={release.genre}          colors={colors} />
                    <MetaRow label="Language"      value={release.language}       colors={colors} />
                    <MetaRow label="Label"         value={release.label}          colors={colors} />
                    <MetaRow label="Copyright"     value={release.copyright}      colors={colors} />
                    <MetaRow label="UPC / EAN"     value={release.upc_ean}        colors={colors} />
                    <MetaRow label="ISRC"          value={release.isrc}           colors={colors} />
                    <MetaRow label="Recording Year" value={release.recording_year} colors={colors} />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen:      { flex: 1, backgroundColor: colors.background },
        scroll:      { flex: 1 },
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 8, paddingBottom: 20 },

        header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, flex: 1, textAlign: 'center' },
        backBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
        backBtnAlt:  { marginTop: 16, padding: 12 },

        hero:        { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
        coverArt:    { width: 110, height: 110, borderRadius: 12 },
        coverPlaceholder: { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
        heroInfo:    { flex: 1, gap: 4, paddingTop: 4 },
        releaseTitle:{ fontSize: 18, fontWeight: '800', color: colors.foreground },
        artistName:  { fontSize: 13, color: colors.mutedForeground },
        badge:       { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
        badgeText:   { fontSize: 10, fontWeight: '700', color: '#fff' },

        statsRow:    { flexDirection: 'row', gap: 12 },
        statCard:    { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4 },
        statValue:   { fontSize: 22, fontWeight: '800' },
        statLabel:   { fontSize: 11 },

        section:     { borderRadius: 16, borderWidth: 1, padding: 16, gap: 0 },
        sectionTitle:{ fontSize: 15, fontWeight: '700', marginBottom: 12 },

        trackItem:   { marginBottom: 8 },
        trackRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
        trackNum:    { fontSize: 12, width: 18, textAlign: 'center' },
        trackTitle:  { flex: 1, fontSize: 13, fontWeight: '600' },
        trackStreams: { fontSize: 11 },
    });
```

- [ ] **Step 2: Create the dynamic route file**

```tsx
// murranno-expo/app/app/releases/[id].tsx
import { ReleaseDetailPage } from '@/pages/ReleaseDetail';
export default function ReleaseDetailRoute() {
    return <ReleaseDetailPage />;
}
```

- [ ] **Step 3: Commit**
```bash
git add murranno-expo/pages/ReleaseDetail.tsx murranno-expo/app/app/releases/[id].tsx
git commit -m "feat(expo): add Release Detail page with audio player"
```

---

## Task 5: Campaign Manager page + route

**Files:**
- Create: `murranno-expo/pages/CampaignManager.tsx`
- Create: `murranno-expo/app/app/campaigns.tsx`
- Modify: `murranno-expo/app/app/_layout.tsx`

- [ ] **Step 1: Create the Campaign Manager page**

```tsx
// murranno-expo/pages/CampaignManager.tsx
import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Target, TrendingUp, DollarSign, Users, ChevronRight } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Campaign, CampaignStats } from '@/types/campaign';

type FilterTab = 'all' | 'Active' | 'Draft' | 'Paused' | 'Completed';

const FILTERS: FilterTab[] = ['all', 'Active', 'Draft', 'Paused', 'Completed'];

const STATUS_COLOR: Record<string, string> = {
    Active:    '#22c55e',
    Draft:     '#6b7280',
    Paused:    '#f59e0b',
    Completed: '#9333ea',
    Rejected:  '#ef4444',
    Cancelled: '#ef4444',
};

export const CampaignManagerPage = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { campaigns, stats, loading } = useCampaigns();
    const [filter, setFilter] = useState<FilterTab>('all');

    const filtered = filter === 'all'
        ? campaigns
        : campaigns.filter((c) => c.status === filter);

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Stats */}
                <View style={s.statsGrid}>
                    {([
                        { icon: <Target size={18} color={colors.primaryGlow} />, label: 'Total', value: stats.totalCampaigns.toString() },
                        { icon: <TrendingUp size={18} color='#22c55e' />, label: 'Active', value: stats.activeCampaigns.toString() },
                        { icon: <DollarSign size={18} color='#f59e0b' />, label: 'Spent', value: `₦${stats.totalSpent}` },
                        { icon: <Users size={18} color='#9333ea' />, label: 'Reach', value: stats.totalReach },
                    ] as const).map(({ icon, label, value }) => (
                        <View key={label} style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {icon}
                            <Text style={[s.statValue, { color: colors.foreground }]}>{value}</Text>
                            <Text style={[s.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* Filter tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
                    {FILTERS.map((f) => {
                        const isActive = filter === f;
                        return (
                            <Pressable
                                key={f}
                                style={[s.filterChip, isActive && { backgroundColor: colors.primaryGlow, borderColor: colors.primaryGlow }]}
                                onPress={() => setFilter(f)}
                            >
                                <Text style={[s.filterChipText, { color: isActive ? '#fff' : colors.foreground }]}>
                                    {f === 'all' ? 'All' : f}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Campaign list */}
                <Text style={[s.sectionTitle, { color: colors.foreground }]}>
                    {filter === 'all' ? 'All Campaigns' : `${filter} Campaigns`}
                </Text>

                {loading ? (
                    <View style={s.centred}>
                        <ActivityIndicator color={colors.primaryGlow} size="large" />
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={s.centred}>
                        <Text style={[s.emptyText, { color: colors.mutedForeground }]}>No campaigns found</Text>
                    </View>
                ) : (
                    filtered.map((campaign) => {
                        const statusColor = STATUS_COLOR[campaign.status] ?? '#6b7280';
                        return (
                            <Pressable
                                key={campaign.id}
                                style={[s.campaignCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => router.push(`/app/campaigns/${campaign.id}` as any)}
                            >
                                <View style={s.campaignTop}>
                                    <View style={{ flex: 1, gap: 2 }}>
                                        <Text style={[s.campaignName, { color: colors.foreground }]} numberOfLines={1}>{campaign.name}</Text>
                                        <Text style={[s.campaignArtist, { color: colors.mutedForeground }]}>{campaign.artist}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                        <View style={[s.statusBadge, { backgroundColor: statusColor }]}>
                                            <Text style={s.statusText}>{campaign.status}</Text>
                                        </View>
                                        <ChevronRight size={16} color={colors.mutedForeground} />
                                    </View>
                                </View>
                                <View style={[s.campaignMeta, { borderTopColor: colors.border }]}>
                                    <Text style={[s.metaItem, { color: colors.mutedForeground }]}>{campaign.type}</Text>
                                    <Text style={[s.metaItem, { color: colors.mutedForeground }]}>Budget: ₦{campaign.budget}</Text>
                                    <Text style={[s.metaItem, { color: colors.mutedForeground }]}>Reach: {campaign.reach}</Text>
                                </View>
                            </Pressable>
                        );
                    })
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen:  { flex: 1, backgroundColor: colors.background },
        scroll:  { flex: 1 },
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 4 },

        statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        statCard:   { width: '47.5%', borderRadius: 16, borderWidth: 1, padding: 14, gap: 4, alignItems: 'flex-start' },
        statValue:  { fontSize: 20, fontWeight: '800' },
        statLabel:  { fontSize: 11, marginTop: -2 },

        filterScroll: { flexGrow: 0 },
        filterChip: {
            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
            borderWidth: 1, borderColor: colors.border, marginRight: 6,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        },
        filterChipText: { fontSize: 12, fontWeight: '600' },

        sectionTitle: { fontSize: 18, fontWeight: '800' },
        centred:      { paddingVertical: 48, alignItems: 'center' },
        emptyText:    { fontSize: 13 },

        campaignCard: {
            borderRadius: 16, borderWidth: 1, overflow: 'hidden',
        },
        campaignTop:   { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
        campaignName:  { fontSize: 14, fontWeight: '700' },
        campaignArtist:{ fontSize: 12 },
        statusBadge:   { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
        statusText:    { fontSize: 10, fontWeight: '700', color: '#fff' },
        campaignMeta:  { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
        metaItem:      { fontSize: 11 },
    });
```

- [ ] **Step 2: Create the route wrapper**

```tsx
// murranno-expo/app/app/campaigns.tsx
import { CampaignManagerPage } from '@/pages/CampaignManager';
export default function CampaignsRoute() {
    return <CampaignManagerPage />;
}
```

- [ ] **Step 3: Register campaigns as a hidden screen in `_layout.tsx`**

In `murranno-expo/app/app/_layout.tsx`, inside the `<Tabs>` block after the last `<Tabs.Screen name="terms" ...>` line, add:
```tsx
<Tabs.Screen name="campaigns"      options={{ href: null }} />
<Tabs.Screen name="campaigns/[id]" options={{ href: null }} />
<Tabs.Screen name="subscriptions"  options={{ href: null }} />
```

- [ ] **Step 4: Commit**
```bash
git add murranno-expo/pages/CampaignManager.tsx murranno-expo/app/app/campaigns.tsx murranno-expo/app/app/_layout.tsx
git commit -m "feat(expo): add Campaign Manager page"
```

---

## Task 6: Campaign Detail page

**Files:**
- Create: `murranno-expo/pages/CampaignDetail.tsx`
- Create: `murranno-expo/app/app/campaigns/[id].tsx`

- [ ] **Step 1: Create the Campaign Detail page**

```tsx
// murranno-expo/pages/CampaignDetail.tsx
import React, { useMemo, useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Target, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Campaign } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';

const STATUS_COLOR: Record<string, string> = {
    Active:    '#22c55e',
    Draft:     '#6b7280',
    Paused:    '#f59e0b',
    Completed: '#9333ea',
    Rejected:  '#ef4444',
    Cancelled: '#ef4444',
};

const InfoRow = ({ label, value, colors }: { label: string; value: string | null | undefined; colors: any }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, maxWidth: '55%', textAlign: 'right' }}>
            {value || '—'}
        </Text>
    </View>
);

export const CampaignDetailPage = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { campaigns, loading } = useCampaigns();
    const [pausing, setPausing] = useState(false);

    const campaign = campaigns.find((c) => c.id === id) ?? null;

    const handlePauseToggle = async () => {
        if (!campaign) return;
        const isActive = campaign.status === 'Active';
        Alert.alert(
            isActive ? 'Pause Campaign' : 'Resume Campaign',
            `Are you sure you want to ${isActive ? 'pause' : 'resume'} this campaign?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: isActive ? 'Pause' : 'Resume',
                    style: isActive ? 'destructive' : 'default',
                    onPress: async () => {
                        setPausing(true);
                        const { error } = await supabase.functions.invoke('pause-campaign', {
                            body: { campaignId: id, currentStatus: campaign.status },
                        });
                        setPausing(false);
                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            router.back();
                        }
                    },
                },
            ],
        );
    };

    if (loading) {
        return (
            <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={colors.primaryGlow} size="large" />
            </View>
        );
    }

    if (!campaign) {
        return (
            <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.mutedForeground }}>Campaign not found.</Text>
                <Pressable style={{ marginTop: 16, padding: 12 }} onPress={() => router.back()}>
                    <Text style={{ color: colors.primaryGlow, fontWeight: '700' }}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    const statusColor = STATUS_COLOR[campaign.status] ?? '#6b7280';
    const canPauseOrResume = campaign.status === 'Active' || campaign.status === 'Paused';

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={s.header}>
                <Pressable style={s.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={22} color={colors.foreground} />
                </Pressable>
                <Text style={s.headerTitle} numberOfLines={1}>Campaign Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Title block */}
                <View style={[s.titleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, gap: 4 }}>
                            <Text style={[s.campaignName, { color: colors.foreground }]}>{campaign.name}</Text>
                            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{campaign.artist}</Text>
                        </View>
                        <View style={[s.statusBadge, { backgroundColor: statusColor }]}>
                            <Text style={s.statusText}>{campaign.status}</Text>
                        </View>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>{campaign.type}</Text>
                </View>

                {/* Metrics */}
                <View style={s.metricsGrid}>
                    {([
                        { icon: <DollarSign size={18} color='#f59e0b' />, label: 'Budget',     value: `₦${campaign.budget}` },
                        { icon: <DollarSign size={18} color='#ef4444' />, label: 'Spent',      value: `₦${campaign.spent}` },
                        { icon: <Users size={18} color='#9333ea' />,      label: 'Reach',      value: campaign.reach },
                        { icon: <TrendingUp size={18} color='#22c55e' />, label: 'Engagement', value: campaign.engagement },
                    ] as const).map(({ icon, label, value }) => (
                        <View key={label} style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {icon}
                            <Text style={[s.metricValue, { color: colors.foreground }]}>{value}</Text>
                            <Text style={[s.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* Details */}
                <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[s.sectionTitle, { color: colors.foreground }]}>Campaign Info</Text>
                    <InfoRow label="Start Date"   value={campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : null} colors={colors} />
                    <InfoRow label="End Date"     value={campaign.endDate   ? new Date(campaign.endDate).toLocaleDateString()   : null} colors={colors} />
                    <InfoRow label="Platform"     value={campaign.platform} colors={colors} />
                    <InfoRow label="Payment Status" value={campaign.paymentStatus} colors={colors} />
                    {campaign.campaignBrief && (
                        <View style={{ paddingVertical: 10 }}>
                            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginBottom: 4 }}>Brief</Text>
                            <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 18 }}>{campaign.campaignBrief}</Text>
                        </View>
                    )}
                </View>

                {/* Target Audience */}
                {campaign.targetAudience && (
                    <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Target Audience</Text>
                        <InfoRow label="Age Range"  value={campaign.targetAudience.ageRange}              colors={colors} />
                        <InfoRow label="Locations"  value={campaign.targetAudience.locations?.join(', ')} colors={colors} />
                        <InfoRow label="Genres"     value={campaign.targetAudience.genres?.join(', ')}    colors={colors} />
                        <InfoRow label="Interests"  value={campaign.targetAudience.interests?.join(', ')} colors={colors} />
                    </View>
                )}

                {/* Rejection reason */}
                {campaign.rejectionReason && (
                    <View style={[s.section, { backgroundColor: '#ef444418', borderColor: '#ef4444' }]}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#ef4444', marginBottom: 6 }}>Rejection Reason</Text>
                        <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 18 }}>{campaign.rejectionReason}</Text>
                    </View>
                )}

                {/* Action */}
                {canPauseOrResume && (
                    <Pressable
                        style={[s.actionBtn, {
                            backgroundColor: campaign.status === 'Active' ? '#f59e0b18' : '#22c55e18',
                            borderColor:     campaign.status === 'Active' ? '#f59e0b'   : '#22c55e',
                        }]}
                        onPress={handlePauseToggle}
                        disabled={pausing}
                    >
                        {pausing
                            ? <ActivityIndicator color={campaign.status === 'Active' ? '#f59e0b' : '#22c55e'} />
                            : <Text style={{ fontSize: 14, fontWeight: '700', color: campaign.status === 'Active' ? '#f59e0b' : '#22c55e' }}>
                                {campaign.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
                              </Text>
                        }
                    </Pressable>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen:  { flex: 1, backgroundColor: colors.background },
        scroll:  { flex: 1 },
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 8 },

        header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, flex: 1, textAlign: 'center' },
        backBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

        titleCard:   { borderRadius: 16, borderWidth: 1, padding: 16 },
        campaignName:{ fontSize: 18, fontWeight: '800' },
        statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
        statusText:  { fontSize: 10, fontWeight: '700', color: '#fff' },

        metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        metricCard:  { width: '47.5%', borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'flex-start', gap: 4 },
        metricValue: { fontSize: 18, fontWeight: '800' },
        metricLabel: { fontSize: 11 },

        section:      { borderRadius: 16, borderWidth: 1, padding: 16 },
        sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },

        actionBtn: { borderRadius: 14, borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
    });
```

- [ ] **Step 2: Create the dynamic route**

```tsx
// murranno-expo/app/app/campaigns/[id].tsx
import { CampaignDetailPage } from '@/pages/CampaignDetail';
export default function CampaignDetailRoute() {
    return <CampaignDetailPage />;
}
```

- [ ] **Step 3: Commit**
```bash
git add murranno-expo/pages/CampaignDetail.tsx murranno-expo/app/app/campaigns/[id].tsx
git commit -m "feat(expo): add Campaign Detail page"
```

---

## Task 7: Subscription Plans page

**Files:**
- Create: `murranno-expo/hooks/useSubscriptions.ts`
- Create: `murranno-expo/pages/SubscriptionPlans.tsx`
- Create: `murranno-expo/app/app/subscriptions.tsx`

- [ ] **Step 1: Create the hook**

```ts
// murranno-expo/hooks/useSubscriptions.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
    is_popular?: boolean;
}

export interface UserSubscription {
    plan_name: string;
    status: string;
    current_period_end: string | null;
}

export const useSubscriptions = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansRes, statusRes] = await Promise.all([
                supabase.functions.invoke('get-subscription-plans'),
                supabase.functions.invoke('get-subscription-status'),
            ]);
            if (plansRes.data?.success)  setPlans(plansRes.data.plans  ?? []);
            if (statusRes.data?.success) setCurrentSub(statusRes.data.subscription ?? null);
        } catch (err) {
            console.error('useSubscriptions error:', err);
        } finally {
            setLoading(false);
        }
    };

    return { plans, currentSub, loading, refetch: fetchData };
};
```

- [ ] **Step 2: Create the Subscription Plans page**

```tsx
// murranno-expo/pages/SubscriptionPlans.tsx
import React, { useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check, Star } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useSubscriptions } from '@/hooks/useSubscriptions';

export const SubscriptionPlansPage = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { plans, currentSub, loading } = useSubscriptions();

    const handleUpgrade = () => {
        Alert.alert(
            'Upgrade Plan',
            'To upgrade or change your subscription, please visit the Murranno web app.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Web App', onPress: () => Linking.openURL('https://murranno.com/app/subscriptions') },
            ],
        );
    };

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={s.header}>
                <Pressable style={s.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={22} color={colors.foreground} />
                </Pressable>
                <Text style={s.headerTitle}>Subscription Plans</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={s.centred}>
                    <ActivityIndicator color={colors.primaryGlow} size="large" />
                </View>
            ) : (
                <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Current plan banner */}
                    {currentSub && (
                        <View style={[s.currentBanner, { backgroundColor: `${colors.primaryGlow}18`, borderColor: colors.primaryGlow }]}>
                            <Text style={[s.currentLabel, { color: colors.primaryGlow }]}>Current Plan</Text>
                            <Text style={[s.currentPlan, { color: colors.foreground }]}>{currentSub.plan_name}</Text>
                            <Text style={[s.currentStatus, { color: colors.mutedForeground }]}>
                                Status: {currentSub.status}
                                {currentSub.current_period_end
                                    ? ` · Renews ${new Date(currentSub.current_period_end).toLocaleDateString()}`
                                    : ''}
                            </Text>
                        </View>
                    )}

                    {/* Plan cards */}
                    {plans.map((plan) => {
                        const isCurrent = currentSub?.plan_name?.toLowerCase() === plan.name?.toLowerCase();
                        return (
                            <View
                                key={plan.id}
                                style={[
                                    s.planCard,
                                    { backgroundColor: colors.card, borderColor: isCurrent ? colors.primaryGlow : colors.border },
                                    plan.is_popular && s.popularCard,
                                ]}
                            >
                                {plan.is_popular && (
                                    <View style={[s.popularBadge, { backgroundColor: colors.primaryGlow }]}>
                                        <Star size={10} color="#fff" />
                                        <Text style={s.popularText}>Most Popular</Text>
                                    </View>
                                )}
                                <Text style={[s.planName, { color: colors.foreground }]}>{plan.name}</Text>
                                <View style={s.priceRow}>
                                    <Text style={[s.planPrice, { color: colors.foreground }]}>
                                        {plan.currency === 'NGN' ? '₦' : '$'}{plan.price.toLocaleString()}
                                    </Text>
                                    <Text style={[s.planInterval, { color: colors.mutedForeground }]}>/{plan.interval}</Text>
                                </View>
                                {(plan.features ?? []).map((feature, i) => (
                                    <View key={i} style={s.featureRow}>
                                        <Check size={14} color='#22c55e' />
                                        <Text style={[s.featureText, { color: colors.foreground }]}>{feature}</Text>
                                    </View>
                                ))}
                                <Pressable
                                    style={[
                                        s.planBtn,
                                        isCurrent
                                            ? { backgroundColor: `${colors.primaryGlow}20`, borderWidth: 1, borderColor: colors.primaryGlow }
                                            : { backgroundColor: colors.primaryGlow },
                                    ]}
                                    onPress={isCurrent ? undefined : handleUpgrade}
                                    disabled={isCurrent}
                                >
                                    <Text style={[s.planBtnText, { color: isCurrent ? colors.primaryGlow : '#fff' }]}>
                                        {isCurrent ? 'Current Plan' : 'Upgrade'}
                                    </Text>
                                </Pressable>
                            </View>
                        );
                    })}

                    {plans.length === 0 && (
                        <View style={s.centred}>
                            <Text style={{ color: colors.mutedForeground }}>No plans available.</Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen:  { flex: 1, backgroundColor: colors.background },
        scroll:  { flex: 1 },
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 8 },
        centred: { flex: 1, justifyContent: 'center', alignItems: 'center' },

        header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, flex: 1, textAlign: 'center' },
        backBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

        currentBanner: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
        currentLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
        currentPlan:   { fontSize: 20, fontWeight: '800' },
        currentStatus: { fontSize: 12 },

        planCard:   { borderRadius: 20, borderWidth: 1, padding: 20, gap: 10, overflow: 'hidden' },
        popularCard:{ borderColor: colors.primaryGlow },
        popularBadge: {
            flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 4,
        },
        popularText: { fontSize: 11, fontWeight: '700', color: '#fff' },
        planName:    { fontSize: 18, fontWeight: '800' },
        priceRow:    { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
        planPrice:   { fontSize: 30, fontWeight: '800' },
        planInterval:{ fontSize: 14 },
        featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
        featureText: { fontSize: 13 },
        planBtn:     { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
        planBtnText: { fontSize: 14, fontWeight: '700' },
    });
```

- [ ] **Step 3: Create the route wrapper**

```tsx
// murranno-expo/app/app/subscriptions.tsx
import { SubscriptionPlansPage } from '@/pages/SubscriptionPlans';
export default function SubscriptionsRoute() {
    return <SubscriptionPlansPage />;
}
```

- [ ] **Step 4: Commit**
```bash
git add murranno-expo/hooks/useSubscriptions.ts murranno-expo/pages/SubscriptionPlans.tsx murranno-expo/app/app/subscriptions.tsx
git commit -m "feat(expo): add Subscription Plans page"
```

---

## Self-Review

**Spec coverage:**
- ✅ Auth: Forgot password screen with real Supabase reset email call + success state
- ✅ Release Detail: dynamic `[id]` route, `useReleaseDetail` hook, full cover/tracks/metadata/stats layout
- ✅ Audio Player: `expo-av` Sound with play/pause/stop/progress, embedded in Release Detail per track
- ✅ Campaign Manager: list with filter chips, stats summary, tap-to-detail navigation
- ✅ Campaign Detail: metrics grid, full info, target audience, rejection reason, pause/resume action
- ✅ Subscription Plans: plans fetched from edge functions, current plan highlighted, upgrade redirects to web

**Placeholder scan:** None found — all steps include complete code.

**Type consistency:**
- `useReleaseDetail` returns `ReleaseDetail` and `Track` types — both used consistently in `ReleaseDetail.tsx`
- `useCampaigns` returns `Campaign` from `@/types/campaign` — same type used in `CampaignDetail.tsx`
- `useSubscriptions` returns `SubscriptionPlan` and `UserSubscription` — both used consistently in `SubscriptionPlans.tsx`
- `useTheme` pattern (`colors`, `isDark`, `makeStyles`) is consistent across all new pages
