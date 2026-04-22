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
    info:          { flex: 1, gap: 4 },
    title:         { fontSize: 13, fontWeight: '600' },
    progressTrack: { height: 3, borderRadius: 2, overflow: 'hidden' },
    progressFill:  { height: '100%', borderRadius: 2 },
    time:          { fontSize: 10 },
    stopBtn:       { padding: 6 },
});
