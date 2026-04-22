import React, { useState, useMemo } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, TextInput, Image,
    Alert, Switch,
} from 'react-native';
import {
    Upload, Music, Image as ImageIcon, Plus, Trash2,
    Check, AlertCircle, ChevronDown, ChevronUp, X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/hooks/useTheme';
import { AppHeader } from '@/components/layout/AppHeader';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { supabase } from '@/integrations/supabase/client';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { KYCGate } from '@/components/kyc/KYCGate';

// ─── constants ────────────────────────────────────────────────────────────────

const DISTRIBUTION_PLATFORMS = [
    'Spotify',   'Apple Music', 'TikTok',      'Instagram',
    'YouTube Music', 'Amazon Music', 'Deezer',  'Tidal',
    'Pandora',   'SoundCloud',  'Audiomack',   'Boomplay',
    'iHeartRadio','Napster',    'Tencent',     'NetEase',
];

const GENRES = [
    'Afrobeats', 'Afro-Pop', 'Afro-Fusion', 'Highlife', 'Fuji',
    'Juju', 'Hip-Hop', 'R&B', 'Pop', 'Gospel', 'Reggae',
    'Electronic', 'Soul', 'Dancehall', 'Amapiano', 'Other',
];

type ReleaseType = 'Single' | 'EP' | 'Album';
type TrackType = 'clean' | 'explicit';

interface TrackItem {
    id: string;
    uri: string | null;
    name: string;
    size: number | null;
    title: string;
    duration: number | null;
    featuredArtists: string[];
    producers: string[];
    legalName: string;
    lyrics: string;
    trackType: TrackType;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const StepIndicator = ({
    step, total, colors,
}: { step: number; total: number; colors: any }) => (
    <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
                <View
                    key={n}
                    style={{
                        width: 28, height: 28, borderRadius: 14,
                        justifyContent: 'center', alignItems: 'center',
                        backgroundColor:
                            n === step ? colors.primaryGlow :
                            n < step  ? `${colors.primaryGlow}40` :
                            colors.background,
                        borderWidth: 1,
                        borderColor: n <= step ? colors.primaryGlow : colors.border,
                    }}
                >
                    <Text style={{
                        fontSize: 11, fontWeight: '700',
                        color: n === step ? '#fff' : n < step ? colors.primaryGlow : colors.mutedForeground,
                    }}>
                        {n}
                    </Text>
                </View>
            ))}
        </View>
        {/* Progress bar */}
        <View style={{ height: 2, backgroundColor: colors.border, borderRadius: 1, overflow: 'hidden' }}>
            <View style={{
                height: '100%',
                width: `${((step - 1) / (total - 1)) * 100}%`,
                backgroundColor: colors.primaryGlow,
                borderRadius: 1,
            }} />
        </View>
    </View>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const UploadWizard = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
    const { uploadImage, uploadAudio, uploading, progress } = useCloudinaryUpload();
    const { profile, loading: profileLoading } = useArtistProfile();

    // Wizard state
    const [step, setStep] = useState(1);
    const TOTAL_STEPS = 5;

    // Step 1: Release Info
    const [releaseType, setReleaseType]           = useState<ReleaseType>('Single');
    const [releaseTitle, setReleaseTitle]         = useState('');
    const [artistName, setArtistName]             = useState('');
    const [primaryGenre, setPrimaryGenre]         = useState('');
    const [secondaryGenre, setSecondaryGenre]     = useState('');
    const [description, setDescription]           = useState('');
    const [coverArtUri, setCoverArtUri]           = useState<string | null>(null);
    const [showGenrePicker, setShowGenrePicker]   = useState<'primary' | 'secondary' | null>(null);

    // Step 2: Tracks
    const [tracks, setTracks] = useState<TrackItem[]>([]);

    // Step 3: Distribution
    const [releaseDate, setReleaseDate]           = useState('');
    const [language, setLanguage]                 = useState('English');
    const [recordingYear, setRecordingYear]       = useState(new Date().getFullYear().toString());
    const [labelName, setLabelName]               = useState('');
    const [isExistingRelease, setIsExistingRelease] = useState(false);
    const [upc, setUpc]                           = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    // Step 4: Credits
    const [globalLegalName, setGlobalLegalName]   = useState('');

    // Step 5: Submit
    const [isSubmitting, setIsSubmitting]         = useState(false);
    const [uploadError, setUploadError]           = useState<string | null>(null);

    if (profileLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator color={colors.primaryGlow} />
            </View>
        );
    }

    if (profile?.kyc_status !== 'verified') {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <AppHeader showCurrencyToggle={false} />
                <KYCGate />
            </View>
        );
    }

    // Step 1: Release Info
    const [releaseType, setReleaseType]           = useState<ReleaseType>('Single');
    const [releaseTitle, setReleaseTitle]         = useState('');
    const [artistName, setArtistName]             = useState('');
    const [primaryGenre, setPrimaryGenre]         = useState('');
    const [secondaryGenre, setSecondaryGenre]     = useState('');
    const [description, setDescription]           = useState('');
    const [coverArtUri, setCoverArtUri]           = useState<string | null>(null);
    const [showGenrePicker, setShowGenrePicker]   = useState<'primary' | 'secondary' | null>(null);

    // Step 2: Tracks
    const [tracks, setTracks] = useState<TrackItem[]>([]);

    // Step 3: Distribution
    const [releaseDate, setReleaseDate]           = useState('');
    const [language, setLanguage]                 = useState('English');
    const [recordingYear, setRecordingYear]       = useState(new Date().getFullYear().toString());
    const [labelName, setLabelName]               = useState('');
    const [isExistingRelease, setIsExistingRelease] = useState(false);
    const [upc, setUpc]                           = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    // Step 4: Credits
    const [globalLegalName, setGlobalLegalName]   = useState('');

    // Step 5: Submit
    const [isSubmitting, setIsSubmitting]         = useState(false);
    const [uploadError, setUploadError]           = useState<string | null>(null);

    // ── helpers ──────────────────────────────────────────────────────────────

    const togglePlatform = (p: string) =>
        setSelectedPlatforms((prev) =>
            prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
        );

    const updateTrack = (id: string, field: keyof TrackItem, value: any) =>
        setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));

    const addDemoTrack = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const newTrack: TrackItem = {
                    id: Math.random().toString(36).substring(7),
                    uri: asset.uri,
                    name: asset.name,
                    size: asset.size ?? null,
                    title: asset.name.replace(/\.[^/.]+$/, ""), // Remove extension
                    duration: null,
                    featuredArtists: [],
                    producers: [],
                    legalName: '',
                    lyrics: '',
                    trackType: 'clean',
                };
                setTracks((prev) => [...prev, newTrack]);
            }
        } catch (err) {
            console.error('Document picking error:', err);
            Alert.alert('Error', 'Failed to pick audio file');
        }
    };

    const pickCoverArt = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need access to your photos to upload cover art.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setCoverArtUri(result.assets[0].uri);
            }
        } catch (err) {
            console.error('Image picking error:', err);
            Alert.alert('Error', 'Failed to pick cover art');
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!releaseTitle.trim()) {
                Alert.alert('Missing Info', 'Please enter a release title');
                return;
            }
            if (!artistName.trim()) {
                Alert.alert('Missing Info', 'Please enter the primary artist name');
                return;
            }
            if (!primaryGenre) {
                Alert.alert('Missing Info', 'Please select a primary genre');
                return;
            }
        } else if (step === 2) {
            if (tracks.length === 0) {
                Alert.alert('Missing Tracks', 'Please add at least one track');
                return;
            }
        } else if (step === 3) {
            if (!releaseDate.trim()) {
                Alert.alert('Missing Info', 'Please enter a release date');
                return;
            }
        }
        setStep((p) => Math.min(p + 1, TOTAL_STEPS));
    };

    const handleBack = () => setStep((p) => Math.max(p - 1, 1));

    const handleSubmit = async () => {
        if (tracks.length === 0) {
            Alert.alert('Error', 'Please add at least one track');
            return;
        }
        setIsSubmitting(true);
        setUploadError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            let { data: artist } = await supabase
                .from('artists')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!artist) {
                const { data: newArtist, error: ae } = await supabase
                    .from('artists')
                    .insert([{ user_id: user.id, stage_name: artistName }])
                    .select('id')
                    .single();
                if (ae) throw ae;
                artist = newArtist;
            }

            const releaseData = {
                title: releaseTitle,
                type: releaseType,
                releaseDate,
                genre: primaryGenre,
                label: labelName || null,
                language,
                recording_year: recordingYear,
                copyright_holder: artistName,
                is_existing_release: isExistingRelease,
                upc: isExistingRelease ? upc : null,
                distribution_platforms: selectedPlatforms,
            };

            const tracksPayload = tracks.map((t) => ({
                title: t.title,
                duration: t.duration || 0,
                featuredArtists: t.featuredArtists,
                producers: t.producers,
                songwriters: [t.legalName || globalLegalName],
                trackType: t.trackType,
                lyrics: t.lyrics,
                songwriter_legal_names: [t.legalName || globalLegalName],
            }));

            // 1. Upload Cover Art
            let remoteCoverArtUrl = null;
            if (coverArtUri) {
                try {
                    const res = await uploadImage({ 
                        uri: coverArtUri, 
                        type: 'image/jpeg', 
                        name: `cover_${Date.now()}.jpg` 
                    }, 'cover-arts');
                    remoteCoverArtUrl = res.url;
                } catch (e) {
                    throw new Error('Failed to upload cover art');
                }
            }

            // 2. Upload Tracks
            const remoteAudioFiles = [];
            for (const t of tracks) {
                if (t.uri) {
                    try {
                        const res = await uploadAudio({ 
                            uri: t.uri, 
                            type: 'audio/wav', 
                            name: t.name 
                        }, 'audio-tracks');
                        remoteAudioFiles.push({ url: res.url });
                    } catch (e) {
                        throw new Error(`Failed to upload track: ${t.title}`);
                    }
                }
            }

            // 3. Submit to Backend
            const { data, error } = await supabase.functions.invoke('upload-track', {
                body: {
                    releaseData,
                    tracks: tracksPayload,
                    coverArtFile: remoteCoverArtUrl ? { url: remoteCoverArtUrl } : null,
                    audioFiles: remoteAudioFiles,
                },
            });

            if (error) throw error;

            Alert.alert('Success', `${releaseType} submitted successfully!`, [
                { text: 'OK', onPress: () => router.replace('/app/music' as any) },
            ]);
        } catch (err: any) {
            console.error('Upload error:', err);
            setUploadError(err.message || 'Failed to upload release');
            Alert.alert('Error', err.message || 'Failed to upload release');
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepTitles = [
        { title: 'Release Info',  subtitle: `General details for your ${releaseType}` },
        { title: 'The Music',     subtitle: `Upload tracks for your ${releaseType}` },
        { title: 'Distribution',  subtitle: 'Platforms and release settings'         },
        { title: 'Track Credits', subtitle: 'Individual details for each song'       },
        { title: 'Review Release',subtitle: 'Double check everything before submitting' },
    ];

    const { title: stepTitle, subtitle: stepSubtitle } = stepTitles[step - 1];

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader showCurrencyToggle={false} />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Step indicator */}
                <StepIndicator step={step} total={TOTAL_STEPS} colors={colors} />

                {/* Step heading */}
                <View style={s.stepHead}>
                    <Text style={s.stepTitle}>{stepTitle}</Text>
                    <Text style={s.stepSubtitle}>{stepSubtitle}</Text>
                </View>

                {/* ─── Step 1: Release Info ─────────────────────────────── */}
                {step === 1 && (
                    <View style={s.card}>
                        {/* Release Type */}
                        <Text style={s.label}>Release Type</Text>
                        <View style={s.typeRow}>
                            {(['Single', 'EP', 'Album'] as ReleaseType[]).map((t) => (
                                <Pressable
                                    key={t}
                                    style={[s.typeBtn, releaseType === t && s.typeBtnActive]}
                                    onPress={() => setReleaseType(t)}
                                >
                                    <Text style={[s.typeBtnText, releaseType === t && s.typeBtnTextActive]}>{t}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <Text style={[s.label, { marginTop: 16 }]}>Release Title *</Text>
                        <TextInput
                            style={s.input}
                            placeholder="Enter release title"
                            placeholderTextColor={colors.mutedForeground}
                            value={releaseTitle}
                            onChangeText={setReleaseTitle}
                        />

                        <Text style={[s.label, { marginTop: 12 }]}>Primary Artist *</Text>
                        <TextInput
                            style={s.input}
                            placeholder="Enter artist name"
                            placeholderTextColor={colors.mutedForeground}
                            value={artistName}
                            onChangeText={setArtistName}
                        />

                        <Text style={[s.label, { marginTop: 12 }]}>Primary Genre *</Text>
                        <Pressable style={s.selector} onPress={() => setShowGenrePicker(showGenrePicker === 'primary' ? null : 'primary')}>
                            <Text style={[s.selectorText, !primaryGenre && { color: colors.mutedForeground }]}>
                                {primaryGenre || 'Select primary genre'}
                            </Text>
                            <ChevronDown size={16} color={colors.mutedForeground} />
                        </Pressable>
                        {showGenrePicker === 'primary' && (
                            <View style={s.pickerList}>
                                {GENRES.map((g) => (
                                    <Pressable key={g} style={s.pickerItem} onPress={() => { setPrimaryGenre(g); setShowGenrePicker(null); }}>
                                        <Text style={[s.pickerItemText, primaryGenre === g && { color: colors.primaryGlow }]}>{g}</Text>
                                        {primaryGenre === g && <Check size={14} color={colors.primaryGlow} />}
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        <Text style={[s.label, { marginTop: 12 }]}>Secondary Genre <Text style={{ color: colors.mutedForeground }}>(Optional)</Text></Text>
                        <Pressable style={s.selector} onPress={() => setShowGenrePicker(showGenrePicker === 'secondary' ? null : 'secondary')}>
                            <Text style={[s.selectorText, !secondaryGenre && { color: colors.mutedForeground }]}>
                                {secondaryGenre || 'Select secondary genre'}
                            </Text>
                            <ChevronDown size={16} color={colors.mutedForeground} />
                        </Pressable>
                        {showGenrePicker === 'secondary' && (
                            <View style={s.pickerList}>
                                {GENRES.map((g) => (
                                    <Pressable key={g} style={s.pickerItem} onPress={() => { setSecondaryGenre(g); setShowGenrePicker(null); }}>
                                        <Text style={[s.pickerItemText, secondaryGenre === g && { color: colors.primaryGlow }]}>{g}</Text>
                                        {secondaryGenre === g && <Check size={14} color={colors.primaryGlow} />}
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        <Text style={[s.label, { marginTop: 12 }]}>Release Description</Text>
                        <TextInput
                            style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                            placeholder="Tell listeners about this release..."
                            placeholderTextColor={colors.mutedForeground}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>
                )}

                {/* Cover Art (still Step 1 but separate card) */}
                {step === 1 && (
                    <View style={s.card}>
                        <Text style={s.cardTitle}>Cover Art *</Text>
                        {coverArtUri ? (
                            <View style={{ position: 'relative' }}>
                                <Image source={{ uri: coverArtUri }} style={s.coverPreview} resizeMode="cover" />
                                <Pressable style={s.removeCover} onPress={() => setCoverArtUri(null)}>
                                    <X size={14} color="#fff" />
                                </Pressable>
                            </View>
                        ) : (
                            <Pressable style={s.coverPickBtn} onPress={pickCoverArt}>
                                <ImageIcon size={32} color={colors.mutedForeground} />
                                <Text style={s.coverPickTitle}>Select Cover Art</Text>
                                <Text style={s.coverPickSub}>3000 x 3000 pixels (1:1 Ratio)</Text>
                            </Pressable>
                        )}
                    </View>
                )}

                {/* ─── Step 2: The Music ────────────────────────────────── */}
                {step === 2 && (
                    <View style={s.card}>
                        {tracks.map((track, idx) => (
                            <View key={track.id} style={s.trackItem}>
                                <View style={s.trackNumBadge}>
                                    <Text style={s.trackNumText}>{idx + 1}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        style={s.trackTitleInput}
                                        value={track.title}
                                        onChangeText={(v) => updateTrack(track.id, 'title', v)}
                                        placeholder="Song Title"
                                        placeholderTextColor={colors.mutedForeground}
                                    />
                                    <Text style={s.trackFilename} numberOfLines={1}>
                                        {track.name} • {track.size ? `${(track.size / 1024 / 1024).toFixed(2)} MB` : '—'}
                                    </Text>
                                </View>
                                <Pressable onPress={() => setTracks((p) => p.filter((t) => t.id !== track.id))}>
                                    <Trash2 size={18} color={colors.destructive} />
                                </Pressable>
                            </View>
                        ))}

                        <Pressable style={s.addTrackBtn} onPress={addDemoTrack}>
                            <Plus size={20} color={colors.mutedForeground} />
                            <Text style={s.addTrackBtnTitle}>Add Tracks</Text>
                            <Text style={s.addTrackBtnSub}>WAV or FLAC</Text>
                        </Pressable>
                    </View>
                )}

                {/* ─── Step 3: Distribution ─────────────────────────────── */}
                {step === 3 && (
                    <>
                        <View style={s.card}>
                            <Text style={s.label}>Release Date *</Text>
                            <TextInput
                                style={s.input}
                                placeholder="dd/mm/yyyy"
                                placeholderTextColor={colors.mutedForeground}
                                value={releaseDate}
                                onChangeText={setReleaseDate}
                            />

                            <View style={s.twoCol}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.label}>Language</Text>
                                    <TextInput style={s.input} value={language} onChangeText={setLanguage} placeholderTextColor={colors.mutedForeground} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.label}>Recording Year</Text>
                                    <TextInput style={s.input} value={recordingYear} onChangeText={setRecordingYear} keyboardType="numeric" placeholderTextColor={colors.mutedForeground} />
                                </View>
                            </View>

                            <Text style={[s.label, { marginTop: 12 }]}>Label Name</Text>
                            <TextInput
                                style={s.input}
                                placeholder="Enter label name (Optional)"
                                placeholderTextColor={colors.mutedForeground}
                                value={labelName}
                                onChangeText={setLabelName}
                            />

                            <View style={s.switchRow}>
                                <View>
                                    <Text style={s.switchLabel}>Existing Release?</Text>
                                    <Text style={s.switchSub}>Do you have an existing UPC?</Text>
                                </View>
                                <Switch
                                    value={isExistingRelease}
                                    onValueChange={setIsExistingRelease}
                                    trackColor={{ false: colors.border, true: colors.primaryGlow }}
                                    thumbColor="#fff"
                                />
                            </View>

                            {isExistingRelease && (
                                <>
                                    <Text style={s.label}>UPC Code *</Text>
                                    <TextInput style={s.input} placeholder="Enter UPC" placeholderTextColor={colors.mutedForeground} value={upc} onChangeText={setUpc} />
                                </>
                            )}
                        </View>

                        {/* Platforms */}
                        <View style={s.card}>
                            <View style={s.platformsHeader}>
                                <View>
                                    <Text style={s.cardTitle}>Distribution Platforms</Text>
                                    <Text style={s.cardSub}>Select stores for your music</Text>
                                </View>
                                <Pressable
                                    style={s.selectAllBtn}
                                    onPress={() =>
                                        setSelectedPlatforms(
                                            selectedPlatforms.length === DISTRIBUTION_PLATFORMS.length
                                                ? []
                                                : [...DISTRIBUTION_PLATFORMS],
                                        )
                                    }
                                >
                                    <Text style={s.selectAllText}>
                                        {selectedPlatforms.length === DISTRIBUTION_PLATFORMS.length ? 'Deselect All' : 'Select All'}
                                    </Text>
                                </Pressable>
                            </View>

                            <View style={s.platformGrid}>
                                {DISTRIBUTION_PLATFORMS.map((p) => {
                                    const on = selectedPlatforms.includes(p);
                                    return (
                                        <Pressable key={p} style={s.platformItem} onPress={() => togglePlatform(p)}>
                                            <View style={[s.checkbox, on && s.checkboxOn]}>
                                                {on && <Check size={10} color="#fff" />}
                                            </View>
                                            <Text style={s.platformName}>{p}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    </>
                )}

                {/* ─── Step 4: Track Credits ────────────────────────────── */}
                {step === 4 && (
                    <>
                        {tracks.map((track, idx) => (
                            <View key={track.id} style={s.card}>
                                <View style={s.creditTrackHeader}>
                                    <View style={s.creditNumBadge}>
                                        <Text style={s.creditNumText}>{idx + 1}</Text>
                                    </View>
                                    <Text style={s.creditTrackTitle} numberOfLines={1}>{track.title}</Text>
                                </View>

                                <Text style={s.label}>Featured Artist</Text>
                                <Pressable
                                    style={s.addTagBtn}
                                    onPress={() => {
                                        Alert.prompt(
                                            'Add Featured Artist',
                                            '',
                                            (val) => { if (val) updateTrack(track.id, 'featuredArtists', [...track.featuredArtists, val]); },
                                            'plain-text',
                                        );
                                    }}
                                >
                                    <Plus size={14} color={colors.primaryGlow} />
                                    <Text style={s.addTagBtnText}>Add featured artist</Text>
                                </Pressable>
                                {track.featuredArtists.map((a, i) => (
                                    <View key={i} style={s.tagChip}>
                                        <Text style={s.tagChipText}>{a}</Text>
                                        <Pressable onPress={() => updateTrack(track.id, 'featuredArtists', track.featuredArtists.filter((_, j) => j !== i))}>
                                            <X size={12} color={colors.mutedForeground} />
                                        </Pressable>
                                    </View>
                                ))}

                                <Text style={[s.label, { marginTop: 12 }]}>Producer</Text>
                                <Pressable
                                    style={s.addTagBtn}
                                    onPress={() => {
                                        Alert.prompt(
                                            'Add Producer',
                                            '',
                                            (val) => { if (val) updateTrack(track.id, 'producers', [...track.producers, val]); },
                                            'plain-text',
                                        );
                                    }}
                                >
                                    <Plus size={14} color={colors.primaryGlow} />
                                    <Text style={s.addTagBtnText}>Add producer</Text>
                                </Pressable>
                                {track.producers.map((p, i) => (
                                    <View key={i} style={s.tagChip}>
                                        <Text style={s.tagChipText}>{p}</Text>
                                        <Pressable onPress={() => updateTrack(track.id, 'producers', track.producers.filter((_, j) => j !== i))}>
                                            <X size={12} color={colors.mutedForeground} />
                                        </Pressable>
                                    </View>
                                ))}

                                <Text style={[s.label, { marginTop: 12 }]}>Songwriter Legal Name(s) *</Text>
                                <TextInput
                                    style={s.input}
                                    placeholder="Full Name (e.g. John Doe)"
                                    placeholderTextColor={colors.mutedForeground}
                                    value={track.legalName}
                                    onChangeText={(v) => updateTrack(track.id, 'legalName', v)}
                                />

                                <Text style={[s.label, { marginTop: 12 }]}>Lyrics</Text>
                                <TextInput
                                    style={[s.input, { height: 96, textAlignVertical: 'top', paddingTop: 12 }]}
                                    placeholder="Enter lyrics here..."
                                    placeholderTextColor={colors.mutedForeground}
                                    value={track.lyrics}
                                    onChangeText={(v) => updateTrack(track.id, 'lyrics', v)}
                                    multiline
                                />

                                <Text style={[s.label, { marginTop: 12 }]}>Explicit Content?</Text>
                                <View style={s.explicitRow}>
                                    {(['clean', 'explicit'] as TrackType[]).map((t) => (
                                        <Pressable
                                            key={t}
                                            style={[s.explicitBtn, track.trackType === t && s.explicitBtnActive]}
                                            onPress={() => updateTrack(track.id, 'trackType', t)}
                                        >
                                            <Text style={[s.explicitBtnText, track.trackType === t && s.explicitBtnTextActive]}>
                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        ))}

                        {/* Quick Artist Tool */}
                        <View style={s.quickToolCard}>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                                <Check size={16} color={colors.warning} />
                                <Text style={s.quickToolTitle}>Quick Artist Tool</Text>
                            </View>
                            <Text style={s.quickToolSub}>Common legal name for all tracks?</Text>
                            <TextInput
                                style={[s.input, { marginTop: 8 }]}
                                placeholder="Enter legal name to apply"
                                placeholderTextColor={colors.mutedForeground}
                                value={globalLegalName}
                                onChangeText={setGlobalLegalName}
                            />
                            <Pressable
                                style={{ marginTop: 6 }}
                                onPress={() => setTracks((prev) => prev.map((t) => ({ ...t, legalName: globalLegalName })))}
                            >
                                <Text style={s.quickToolLink}>Apply to all tracks</Text>
                            </Pressable>
                        </View>
                    </>
                )}

                {/* ─── Step 5: Review ───────────────────────────────────── */}
                {step === 5 && (
                    <View style={s.card}>
                        {/* Release header */}
                        <View style={s.reviewHeader}>
                            {coverArtUri ? (
                                <Image source={{ uri: coverArtUri }} style={s.reviewCover} resizeMode="cover" />
                            ) : (
                                <View style={[s.reviewCover, s.reviewCoverPlaceholder]}>
                                    <Music size={24} color={colors.mutedForeground} />
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={s.reviewTitle} numberOfLines={2}>{releaseTitle || 'Untitled'}</Text>
                                <Text style={s.reviewArtist}>{artistName || 'Unknown Artist'}</Text>
                                <Text style={s.reviewType}>{releaseType} • {tracks.length} track(s)</Text>
                            </View>
                        </View>

                        {/* Track list */}
                        {tracks.length > 0 && (
                            <View style={s.reviewTracks}>
                                {tracks.map((t, i) => (
                                    <View key={t.id} style={[s.reviewTrackRow, i < tracks.length - 1 && s.reviewTrackBorder]}>
                                        <Text style={s.reviewTrackNum}>{i + 1}.</Text>
                                        <Text style={s.reviewTrackName} numberOfLines={1}>{t.title}</Text>
                                        {t.trackType === 'explicit' && (
                                            <View style={s.eBadge}><Text style={s.eBadgeText}>E</Text></View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Metadata grid */}
                        <View style={s.reviewGrid}>
                            {[
                                ['Release Date',   releaseDate],
                                ['Primary Genre',  primaryGenre],
                                ['Language',       language],
                                ['Copyright',      artistName],
                                ['Platforms',      `${selectedPlatforms.length} Selected`],
                            ].map(([label, value]) => (
                                <View key={label} style={s.reviewGridItem}>
                                    <Text style={s.reviewGridLabel}>{label}</Text>
                                    <Text style={s.reviewGridValue}>{value}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Upload error */}
                        {uploadError && (
                            <View style={s.errorBox}>
                                <AlertCircle size={14} color={colors.destructive} />
                                <Text style={s.errorText}>{uploadError}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Navigation */}
                <View style={s.navRow}>
                    <Pressable
                        style={[s.backBtn, step === 1 && { opacity: 0.4 }]}
                        onPress={handleBack}
                        disabled={step === 1}
                    >
                        <Text style={s.backBtnText}>Back</Text>
                    </Pressable>

                    {step < TOTAL_STEPS ? (
                        <Pressable style={s.nextBtn} onPress={handleNext}>
                            <Text style={s.nextBtnText}>Next Step</Text>
                        </Pressable>
                    ) : (
                        <Pressable
                            style={[s.nextBtn, (isSubmitting || uploading) && { opacity: 0.5 }]}
                            onPress={handleSubmit}
                            disabled={isSubmitting || uploading}
                        >
                            {isSubmitting || uploading
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={s.nextBtnText}>Submit Release</Text>
                            }
                        </Pressable>
                    )}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

// ─── styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1 },
        scrollContent: { paddingHorizontal: 16, gap: 14, paddingTop: 4 },

        stepHead: { alignItems: 'center', gap: 4 },
        stepTitle: { fontSize: 22, fontWeight: '800', color: colors.foreground },
        stepSubtitle: { fontSize: 12, color: colors.mutedForeground },

        card: {
            backgroundColor: colors.card, borderRadius: 20,
            borderWidth: 1, borderColor: colors.border, padding: 16, gap: 0,
        },
        cardTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
        cardSub:   { fontSize: 12, color: colors.mutedForeground },

        label:    { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 6, marginTop: 0 },
        input: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1, borderColor: colors.border, borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: colors.foreground,
        },
        selector: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1, borderColor: colors.border, borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 11,
        },
        selectorText: { fontSize: 14, color: colors.foreground },
        pickerList: {
            backgroundColor: isDark ? '#101d36' : colors.card,
            borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginTop: 4,
            maxHeight: 200, overflow: 'hidden',
        },
        pickerItem: {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: 14, paddingVertical: 10,
            borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        pickerItemText: { fontSize: 14, color: colors.foreground },

        typeRow: { flexDirection: 'row', gap: 8, marginBottom: 0 },
        typeBtn: {
            flex: 1, paddingVertical: 10, borderRadius: 12,
            borderWidth: 1, borderColor: colors.border, alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        },
        typeBtnActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryGlow },
        typeBtnText: { fontSize: 13, fontWeight: '600', color: colors.mutedForeground },
        typeBtnTextActive: { color: '#fff' },

        coverPickBtn: {
            borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border,
            borderRadius: 16, paddingVertical: 40, alignItems: 'center', gap: 8,
        },
        coverPickTitle: { fontSize: 15, fontWeight: '600', color: colors.foreground },
        coverPickSub:   { fontSize: 11, color: colors.mutedForeground },
        coverPreview: { width: '100%', aspectRatio: 1, borderRadius: 12 },
        removeCover: {
            position: 'absolute', top: 8, right: 8,
            backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 4,
        },

        // Tracks
        trackItem: {
            flexDirection: 'row', alignItems: 'center', gap: 10,
            padding: 10, borderRadius: 12,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            marginBottom: 8, borderWidth: 1, borderColor: colors.border,
        },
        trackNumBadge: {
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: `${colors.primaryGlow}22`,
            justifyContent: 'center', alignItems: 'center',
        },
        trackNumText:  { fontSize: 12, fontWeight: '700', color: colors.primaryGlow },
        trackTitleInput: {
            fontSize: 14, fontWeight: '600', color: colors.foreground,
            paddingVertical: 0, paddingHorizontal: 0,
        },
        trackFilename: { fontSize: 10, color: colors.mutedForeground, marginTop: 2 },
        addTrackBtn: {
            borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border,
            borderRadius: 12, paddingVertical: 20, alignItems: 'center', gap: 4,
        },
        addTrackBtnTitle: { fontSize: 13, fontWeight: '600', color: colors.mutedForeground },
        addTrackBtnSub:   { fontSize: 10, color: colors.mutedForeground },

        // Distribution
        twoCol: { flexDirection: 'row', gap: 10, marginTop: 12 },
        switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
        switchLabel: { fontSize: 14, fontWeight: '600', color: colors.foreground },
        switchSub:   { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
        platformsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
        selectAllBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
        selectAllText: { fontSize: 12, fontWeight: '600', color: colors.foreground },
        platformGrid: { flexDirection: 'row', flexWrap: 'wrap' },
        platformItem: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
        checkbox: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
        checkboxOn: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryGlow },
        platformName: { fontSize: 13, color: colors.foreground },

        // Credits
        creditTrackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 12 },
        creditNumBadge: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.primaryGlow, justifyContent: 'center', alignItems: 'center' },
        creditNumText:  { fontSize: 11, fontWeight: '700', color: colors.primaryGlow },
        creditTrackTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.foreground },
        addTagBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
        addTagBtnText: { fontSize: 13, fontWeight: '600', color: colors.primaryGlow },
        tagChip: {
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: `${colors.primaryGlow}18`,
            borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
            alignSelf: 'flex-start', marginTop: 4,
        },
        tagChipText: { fontSize: 12, color: colors.primaryGlow },
        explicitRow: { flexDirection: 'row', gap: 8 },
        explicitBtn: {
            flex: 1, paddingVertical: 10, borderRadius: 12,
            borderWidth: 1, borderColor: colors.border, alignItems: 'center',
        },
        explicitBtnActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryGlow },
        explicitBtnText: { fontSize: 13, fontWeight: '600', color: colors.mutedForeground },
        explicitBtnTextActive: { color: '#fff' },
        quickToolCard: {
            backgroundColor: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.08)',
            borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
            borderRadius: 20, padding: 16,
        },
        quickToolTitle: { fontSize: 13, fontWeight: '700', color: colors.warning },
        quickToolSub:   { fontSize: 12, color: colors.mutedForeground },
        quickToolLink:  { fontSize: 13, fontWeight: '600', color: colors.primaryGlow, marginTop: 4 },

        // Review
        reviewHeader: { flexDirection: 'row', gap: 14, marginBottom: 16 },
        reviewCover:  { width: 80, height: 80, borderRadius: 12 },
        reviewCoverPlaceholder: { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
        reviewTitle:  { fontSize: 18, fontWeight: '800', color: colors.foreground },
        reviewArtist: { fontSize: 14, color: colors.mutedForeground, marginTop: 2 },
        reviewType:   { fontSize: 12, fontWeight: '600', color: colors.foreground, marginTop: 4 },
        reviewTracks: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginBottom: 16 },
        reviewTrackRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
        reviewTrackBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
        reviewTrackNum: { fontSize: 13, color: colors.mutedForeground, fontWeight: '600', width: 20 },
        reviewTrackName:{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.foreground },
        eBadge: { backgroundColor: colors.destructive, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
        eBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
        reviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
        reviewGridItem: { width: '45%' },
        reviewGridLabel:{ fontSize: 11, color: colors.mutedForeground, marginBottom: 2 },
        reviewGridValue:{ fontSize: 13, fontWeight: '700', color: colors.foreground },
        errorBox: { flexDirection: 'row', gap: 8, backgroundColor: `${colors.destructive}18`, borderRadius: 10, padding: 10, marginTop: 12 },
        errorText: { flex: 1, fontSize: 12, color: colors.destructive },

        // Nav buttons
        navRow: { flexDirection: 'row', gap: 10 },
        backBtn: {
            flex: 1, paddingVertical: 14, borderRadius: 14,
            borderWidth: 1, borderColor: colors.border, alignItems: 'center',
        },
        backBtnText: { fontSize: 15, fontWeight: '600', color: colors.foreground },
        nextBtn: {
            flex: 1.5, paddingVertical: 14, borderRadius: 14,
            backgroundColor: colors.primaryGlow, alignItems: 'center',
        },
        nextBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    });
