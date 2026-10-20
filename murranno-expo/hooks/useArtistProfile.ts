import {notify, errorMessage} from '@/lib/api';
import {useCloudinaryUpload} from '@/hooks/useCloudinaryUpload';
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { API_URL, supabase } from '@/integrations/supabase/client';

export interface RNFile {
  uri: string;
  type: string;
  name: string;
}

export interface ArtistProfile {
  id: string;
  stage_name: string;
  bio: string | null;
  profile_image: string | null;
  spotify_id: string | null;
  apple_music_id: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  audiomack_url: string | null;
  soundcloud_url: string | null;
  apple_music_url: string | null;
  deezer_url: string | null;
  tidal_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  created_at: string;
  kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
  kyc_tier: number | null;
}

export const useArtistProfile = () => {
  const {uploadImage} = useCloudinaryUpload();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const [{ data, error }, { data: account, error: accountError }] = await Promise.all([supabase.functions.invoke('get-artist-profile'), supabase.functions.invoke('get-profile')]);
      if (accountError) throw accountError;

      if (error) throw error;
      if (account?.profile) setProfile({ ...(data?.artist || { id: '', stage_name: account.profile.full_name || 'Artist' }), kyc_status: account.profile.kyc_status, kyc_tier: account.profile.kyc_tier });
    } catch (error: any) {
      console.error('Error fetching artist profile:', error);
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ArtistProfile> & { personal?: Record<string, string> }) => {
    try {
      setUpdating(true);
      const { data, error } = await supabase.functions.invoke('update-artist-profile', {
        body: updates,
      });

      if (error) throw error;

      if (data?.artist) {
        setProfile(data.artist);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      notify('Profile not saved', await errorMessage(error));
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const uploadProfileImage = async (file: RNFile) => {
    try { return (await uploadImage(file, 'profile-images')).url; }
    catch (error: any) { notify('Image not uploaded', error.message); return null; }
  };

  useFocusEffect(useCallback(() => { fetchProfile(); }, []));

  return {
    profile,
    loading,
    updating,
    updateProfile,
    uploadProfileImage,
    refetch: fetchProfile,
  };
};
