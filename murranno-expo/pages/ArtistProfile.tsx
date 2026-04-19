import React, { useState, useMemo, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, StatusBar,
    Pressable, ActivityIndicator, TextInput, Image,
    Alert,
} from 'react-native';
import {
    Edit2, Share2, Save, X, Plus, Music2,
    User,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/layout/AppHeader';

// ─── Platform row ─────────────────────────────────────────────────────────────

const PlatformRow = ({
    name, value, onChange, isEditing, colors,
}: { name: string; value: string; onChange: (v: string) => void; isEditing: boolean; colors: any }) => (
    <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    }}>
        <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: `${colors.primaryGlow}18`,
            justifyContent: 'center', alignItems: 'center',
        }}>
            <Music2 size={16} color={colors.primaryGlow} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>{name}</Text>
            {isEditing ? (
                <TextInput
                    style={{
                        fontSize: 12, color: colors.foreground, marginTop: 4,
                        borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 2,
                    }}
                    value={value}
                    onChangeText={onChange}
                    placeholder={`https://...`}
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    keyboardType="url"
                />
            ) : (
                <Text style={{ fontSize: 12, color: value ? colors.primaryGlow : colors.mutedForeground, marginTop: 2 }} numberOfLines={1}>
                    {value || 'Not connected'}
                </Text>
            )}
        </View>
        {!isEditing && (
            <Pressable style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: `${colors.primaryGlow}18`,
                justifyContent: 'center', alignItems: 'center',
            }}>
                <Plus size={14} color={colors.primaryGlow} />
            </Pressable>
        )}
    </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const ArtistProfile = () => {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

    const { profile, loading, updating, updateProfile } = useArtistProfile();

    const [isEditing, setIsEditing]   = useState(false);
    const [firstName, setFirstName]   = useState('');
    const [lastName, setLastName]     = useState('');
    const [phone, setPhone]           = useState('');
    const [nin, setNin]               = useState('');
    const [stageName, setStageName]   = useState('');
    const [bio, setBio]               = useState('');

    // Streaming/social
    const [spotifyId, setSpotifyId]           = useState('');
    const [appleId, setAppleId]               = useState('');
    const [spotifyUrl, setSpotifyUrl]         = useState('');
    const [appleUrl, setAppleUrl]             = useState('');
    const [youtubeUrl, setYoutubeUrl]         = useState('');
    const [audiomackUrl, setAudiomackUrl]     = useState('');
    const [soundcloudUrl, setSoundcloudUrl]   = useState('');
    const [deezerUrl, setDeezerUrl]           = useState('');
    const [tidalUrl, setTidalUrl]             = useState('');
    const [instagramUrl, setInstagramUrl]     = useState('');
    const [facebookUrl, setFacebookUrl]       = useState('');
    const [tiktokUrl, setTiktokUrl]           = useState('');
    const [twitterUrl, setTwitterUrl]         = useState('');

    useEffect(() => {
        if (profile) {
            setStageName(profile.stage_name || '');
            setBio(profile.bio || '');
            setSpotifyId(profile.spotify_id || '');
            setAppleId(profile.apple_music_id || '');
            setSpotifyUrl(profile.spotify_url || '');
            setAppleUrl(profile.apple_music_url || '');
            setYoutubeUrl(profile.youtube_url || '');
            setAudiomackUrl(profile.audiomack_url || '');
            setSoundcloudUrl(profile.soundcloud_url || '');
            setDeezerUrl(profile.deezer_url || '');
            setTidalUrl(profile.tidal_url || '');
            setInstagramUrl(profile.instagram_url || '');
            setFacebookUrl(profile.facebook_url || '');
            setTiktokUrl(profile.tiktok_url || '');
            setTwitterUrl(profile.twitter_url || '');
        }
    }, [profile]);

    // Fetch personal info from profiles table
    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from('profiles').select('first_name,last_name,phone_number,nin_number').eq('id', user.id).maybeSingle();
            if (data) {
                setFirstName(data.first_name || '');
                setLastName(data.last_name || '');
                setPhone(data.phone_number || '');
                setNin(data.nin_number || '');
            }
        })();
    }, []);

    const handleSave = async () => {
        const success = await updateProfile({
            stage_name:     stageName,
            bio,
            spotify_id:     spotifyId,
            apple_music_id: appleId,
            spotify_url:    spotifyUrl,
            apple_music_url:appleUrl,
            youtube_url:    youtubeUrl,
            audiomack_url:  audiomackUrl,
            soundcloud_url: soundcloudUrl,
            deezer_url:     deezerUrl,
            tidal_url:      tidalUrl,
            instagram_url:  instagramUrl,
            facebook_url:   facebookUrl,
            tiktok_url:     tiktokUrl,
            twitter_url:    twitterUrl,
        });

        if (success) {
            // Also save personal info
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({
                    first_name:   firstName,
                    last_name:    lastName,
                    full_name:    `${firstName} ${lastName}`.trim(),
                    phone_number: phone,
                    nin_number:   nin,
                }).eq('id', user.id);
            }
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setStageName(profile.stage_name || '');
            setBio(profile.bio || '');
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <View style={s.centred}>
                <ActivityIndicator color={colors.primaryGlow} size="large" />
            </View>
        );
    }

    const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : '—';

    return (
        <View style={s.screen}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <AppHeader showCurrencyToggle={false} />

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Avatar + Info */}
                <View style={s.profileCard}>
                    <Pressable style={s.avatarWrap}>
                        {profile?.profile_image ? (
                            <Image source={{ uri: profile.profile_image }} style={s.avatar} />
                        ) : (
                            <View style={s.avatarPlaceholder}>
                                <User size={36} color={colors.mutedForeground} />
                            </View>
                        )}
                    </Pressable>

                    {isEditing ? (
                        <View style={s.editInfoWrap}>
                            {/* Personal Info */}
                            <Text style={s.sectionHeader}>Personal Information</Text>
                            <View style={s.twoCol}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.miniLabel}>First Name</Text>
                                    <TextInput style={s.input} value={firstName} onChangeText={setFirstName} placeholder="First Name" placeholderTextColor={colors.mutedForeground} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.miniLabel}>Last Name</Text>
                                    <TextInput style={s.input} value={lastName} onChangeText={setLastName} placeholder="Last Name" placeholderTextColor={colors.mutedForeground} />
                                </View>
                            </View>
                            <View style={s.twoCol}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.miniLabel}>Phone Number</Text>
                                    <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" placeholderTextColor={colors.mutedForeground} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.miniLabel}>NIN Number</Text>
                                    <TextInput style={s.input} value={nin} onChangeText={setNin} placeholder="NIN" keyboardType="numeric" placeholderTextColor={colors.mutedForeground} />
                                </View>
                            </View>

                            <Text style={[s.sectionHeader, { marginTop: 16 }]}>Artist Details</Text>
                            <Text style={s.miniLabel}>Artist Bio</Text>
                            <TextInput
                                style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Artist Bio"
                                placeholderTextColor={colors.mutedForeground}
                                multiline
                            />
                        </View>
                    ) : (
                        <>
                            <Text style={s.stageName}>{profile?.stage_name || 'Artist'}</Text>
                            {profile?.bio ? (
                                <Text style={s.bioText}>{profile.bio}</Text>
                            ) : null}
                            <View style={s.statsRow}>
                                <View style={s.statItem}>
                                    <Text style={s.statNum}>0</Text>
                                    <Text style={s.statLabel}>Releases</Text>
                                </View>
                                <View style={s.statDivider} />
                                <View style={s.statItem}>
                                    <Text style={s.statNum}>{memberSince}</Text>
                                    <Text style={s.statLabel}>Member Since</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Edit / Share buttons */}
                <View style={s.actionRow}>
                    {isEditing ? (
                        <>
                            <Pressable style={[s.actionBtn, s.actionBtnPrimary]} onPress={handleSave} disabled={updating}>
                                {updating
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <><Save size={16} color="#fff" /><Text style={s.actionBtnPrimaryText}>Save Changes</Text></>
                                }
                            </Pressable>
                            <Pressable style={[s.actionBtn, s.actionBtnOutline]} onPress={handleCancel} disabled={updating}>
                                <X size={16} color={colors.foreground} />
                                <Text style={s.actionBtnOutlineText}>Cancel</Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <Pressable style={[s.actionBtn, s.actionBtnPrimary]} onPress={() => setIsEditing(true)}>
                                <Edit2 size={16} color="#fff" />
                                <Text style={s.actionBtnPrimaryText}>Edit Profile</Text>
                            </Pressable>
                            <Pressable style={[s.actionBtn, s.actionBtnOutline]} onPress={() => Alert.alert('Share', 'Share feature coming soon')}>
                                <Share2 size={16} color={colors.foreground} />
                                <Text style={s.actionBtnOutlineText}>Share</Text>
                            </Pressable>
                        </>
                    )}
                </View>

                {/* Major Streaming Services */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Major Streaming Services</Text>
                    {isEditing && (
                        <View style={s.idInputsCard}>
                            <Text style={s.miniLabel}>SPOTIFY ARTIST ID</Text>
                            <TextInput style={s.input} value={spotifyId} onChangeText={setSpotifyId} placeholder="e.g. 4Z8W4fUhv5... (from URI)" placeholderTextColor={colors.mutedForeground} autoCapitalize="none" />
                            <Text style={[s.miniLabel, { marginTop: 8 }]}>APPLE MUSIC ARTIST ID</Text>
                            <TextInput style={s.input} value={appleId} onChangeText={setAppleId} placeholder="e.g. 123456789" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
                        </View>
                    )}
                    <PlatformRow name="Spotify for Artists" value={spotifyUrl} onChange={setSpotifyUrl} isEditing={isEditing} colors={colors} />
                    <PlatformRow name="Apple Music"          value={appleUrl}   onChange={setAppleUrl}   isEditing={isEditing} colors={colors} />
                    <PlatformRow name="YouTube Music"        value={youtubeUrl} onChange={setYoutubeUrl} isEditing={isEditing} colors={colors} />
                </View>

                {/* Additional Platforms */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Additional Streaming Platforms</Text>
                    <PlatformRow name="Audiomack"  value={audiomackUrl}  onChange={setAudiomackUrl}  isEditing={isEditing} colors={colors} />
                    <PlatformRow name="SoundCloud" value={soundcloudUrl} onChange={setSoundcloudUrl} isEditing={isEditing} colors={colors} />
                    <PlatformRow name="Deezer"     value={deezerUrl}     onChange={setDeezerUrl}     isEditing={isEditing} colors={colors} />
                    <PlatformRow name="Tidal"      value={tidalUrl}      onChange={setTidalUrl}      isEditing={isEditing} colors={colors} />
                </View>

                {/* Social Media */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Social Media</Text>
                    <PlatformRow name="Instagram" value={instagramUrl} onChange={setInstagramUrl} isEditing={isEditing} colors={colors} />
                    <PlatformRow name="Facebook"  value={facebookUrl}  onChange={setFacebookUrl}  isEditing={isEditing} colors={colors} />
                    <PlatformRow name="TikTok"    value={tiktokUrl}    onChange={setTiktokUrl}    isEditing={isEditing} colors={colors} />
                    <PlatformRow name="Twitter/X" value={twitterUrl}   onChange={setTwitterUrl}   isEditing={isEditing} colors={colors} />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

// ─── styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) =>
    StyleSheet.create({
        screen: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1 },
        scrollContent: { paddingHorizontal: 16, paddingTop: 60, gap: 14 },
        centred: { flex: 1, justifyContent: 'center', alignItems: 'center' },

        // Profile card
        profileCard: {
            backgroundColor: colors.card, borderRadius: 20,
            borderWidth: 1, borderColor: colors.border, padding: 20,
            alignItems: 'center', gap: 10,
        },
        avatarWrap: { marginBottom: 4 },
        avatar: { width: 80, height: 80, borderRadius: 40 },
        avatarPlaceholder: {
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            justifyContent: 'center', alignItems: 'center',
        },
        stageName: { fontSize: 20, fontWeight: '800', color: colors.foreground },
        bioText:   { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', maxWidth: 280 },
        statsRow:  { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 4 },
        statItem:  { alignItems: 'center' },
        statNum:   { fontSize: 16, fontWeight: '700', color: colors.foreground },
        statLabel: { fontSize: 11, color: colors.mutedForeground },
        statDivider: { width: 1, height: 24, backgroundColor: colors.border },

        // Edit mode
        editInfoWrap: { width: '100%', gap: 8 },
        sectionHeader: { fontSize: 10, fontWeight: '700', color: colors.mutedForeground, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
        twoCol: { flexDirection: 'row', gap: 8 },
        miniLabel: { fontSize: 10, fontWeight: '600', color: colors.mutedForeground, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
        input: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1, borderColor: colors.border, borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: colors.foreground,
        },

        // Action buttons
        actionRow: { flexDirection: 'row', gap: 10 },
        actionBtn: {
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: 6, paddingVertical: 12, borderRadius: 14,
        },
        actionBtnPrimary: { backgroundColor: colors.primaryGlow },
        actionBtnPrimaryText: { fontSize: 14, fontWeight: '700', color: '#fff' },
        actionBtnOutline: { borderWidth: 1, borderColor: colors.border },
        actionBtnOutlineText: { fontSize: 14, fontWeight: '600', color: colors.foreground },

        // Sections
        section: {
            backgroundColor: colors.card, borderRadius: 20,
            borderWidth: 1, borderColor: colors.border, padding: 16,
        },
        sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
        idInputsCard: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            borderRadius: 12, padding: 12, marginBottom: 8,
        },
    });
