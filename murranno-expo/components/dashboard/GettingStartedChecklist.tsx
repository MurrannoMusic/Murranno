import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useReleases } from '@/hooks/useReleases';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useTheme } from '@/hooks/useTheme';

export const GettingStartedChecklist = () => {
    const { profile } = useArtistProfile();
    const { releases } = useReleases();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const isProfileComplete = !!(profile?.first_name && profile?.stage_name);
    const hasUploadedTrack  = releases.length > 0;

    const steps = [
        { label: 'Complete Profile',    done: isProfileComplete, path: '/app/profile'  },
        { label: 'Upload First Track',  done: hasUploadedTrack,  path: '/app/upload'   },
        { label: 'Link Streaming Links',done: false,             path: '/app/account'  },
    ];

    if (steps.every((step) => step.done)) return null;

    return (
        <View style={s.container}>
            <Text style={s.title}>Getting Started</Text>
            <View style={s.list}>
                {steps.map((step, i) => (
                    <Pressable
                        key={i}
                        style={({ pressed }) => [s.stepRow, pressed && { opacity: 0.7 }]}
                        onPress={() => router.push(step.path as any)}
                    >
                        <View style={s.stepLeft}>
                            {step.done
                                ? <CheckCircle2 size={20} color={colors.success} />
                                : <Circle size={20} color={colors.mutedForeground} />
                            }
                            <Text style={[s.stepLabel, step.done && s.stepLabelDone]}>
                                {step.label}
                            </Text>
                        </View>
                        {!step.done && <Text style={s.startText}>Start</Text>}
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

function makeStyles(colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) {
    return StyleSheet.create({
        container: {
            padding: 16, borderRadius: 16,
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.card,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
        },
        title:         { fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
        list:          { gap: 12 },
        stepRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
        stepLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
        stepLabel:     { fontSize: 14, color: colors.foreground },
        stepLabelDone: { color: colors.mutedForeground, textDecorationLine: 'line-through' },
        startText:     { fontSize: 12, fontWeight: '600', color: colors.primaryGlow },
    });
}
