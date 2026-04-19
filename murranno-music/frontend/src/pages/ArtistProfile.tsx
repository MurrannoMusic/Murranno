import { useState, useEffect } from 'react';
import { Settings, Edit, Save, X, Music, Music2, Disc3, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { StreamingPlatformCard } from '@/components/profile/StreamingPlatformCard';
import { SocialLinkCard } from '@/components/profile/SocialLinkCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { validateImageFile } from '@/utils/fileValidation';
import { toast } from '@/hooks/use-toast';
import { useShare } from '@/hooks/useShare';

export const ArtistProfile = () => {
  const navigate = useNavigate();
  const { profile, loading, updating, updateProfile, uploadProfileImage } = useArtistProfile();
  const { profile: userProfile, refreshUserData } = useAuth();
  const { shareArtist } = useShare();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    nin_number: '',
    stage_name: '',
    bio: '',
    profile_image: '',
    spotify_id: '',
    apple_music_id: '',
    spotify_url: '',
    youtube_url: '',
    apple_music_url: '',
    audiomack_url: '',
    soundcloud_url: '',
    deezer_url: '',
    tidal_url: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    twitter_url: '',
  });

  useEffect(() => {
    if (profile && userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone_number: userProfile.phone_number || '',
        nin_number: userProfile.nin_number || '',
        stage_name: profile.stage_name || '',
        bio: profile.bio || '',
        profile_image: profile.profile_image || '',
        spotify_id: profile.spotify_id || '',
        apple_music_id: profile.apple_music_id || '',
        spotify_url: profile.spotify_url || '',
        youtube_url: profile.youtube_url || '',
        apple_music_url: profile.apple_music_url || '',
        audiomack_url: profile.audiomack_url || '',
        soundcloud_url: profile.soundcloud_url || '',
        deezer_url: profile.deezer_url || '',
        tidal_url: profile.tidal_url || '',
        instagram_url: profile.instagram_url || '',
        facebook_url: profile.facebook_url || '',
        tiktok_url: profile.tiktok_url || '',
        twitter_url: profile.twitter_url || '',
      });
    }
  }, [profile, userProfile]);

  const handleImageSelect = async (file: File) => {
    const { valid, error } = validateImageFile(file);
    if (!valid) {
      toast({
        title: 'Invalid image',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    const url = await uploadProfileImage(file);
    if (url) {
      setFormData(prev => ({ ...prev, profile_image: url }));
      if (!isEditing) {
        await updateProfile({ profile_image: url });
      }
    }
  };

  const handleSave = async () => {
    try {
      // 1. Update Artist Profile
      const artistSuccess = await updateProfile({
        stage_name: formData.stage_name,
        bio: formData.bio,
        profile_image: formData.profile_image,
        spotify_id: formData.spotify_id,
        apple_music_id: formData.apple_music_id,
        spotify_url: formData.spotify_url,
        youtube_url: formData.youtube_url,
        apple_music_url: formData.apple_music_url,
        audiomack_url: formData.audiomack_url,
        soundcloud_url: formData.soundcloud_url,
        deezer_url: formData.deezer_url,
        tidal_url: formData.tidal_url,
        instagram_url: formData.instagram_url,
        facebook_url: formData.facebook_url,
        tiktok_url: formData.tiktok_url,
        twitter_url: formData.twitter_url,
      });

      // 2. Update User Profile (Personal Info)
      if (userProfile) {
        const { error: userError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            full_name: `${formData.first_name} ${formData.last_name}`.trim(),
            phone_number: formData.phone_number,
            nin_number: formData.nin_number,
          })
          .eq('id', userProfile.id);

        if (userError) throw userError;
        await refreshUserData();
      }

      if (artistSuccess) {
        setIsEditing(false);
        toast({ title: 'Profile updated successfully' });
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error saving profile',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    if (profile && userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone_number: userProfile.phone_number || '',
        nin_number: userProfile.nin_number || '',
        stage_name: profile.stage_name || '',
        bio: profile.bio || '',
        profile_image: profile.profile_image || '',
        spotify_id: profile.spotify_id || '',
        apple_music_id: profile.apple_music_id || '',
        spotify_url: profile.spotify_url || '',
        youtube_url: profile.youtube_url || '',
        apple_music_url: profile.apple_music_url || '',
        audiomack_url: profile.audiomack_url || '',
        soundcloud_url: profile.soundcloud_url || '',
        deezer_url: profile.deezer_url || '',
        tidal_url: profile.tidal_url || '',
        instagram_url: profile.instagram_url || '',
        facebook_url: profile.facebook_url || '',
        tiktok_url: profile.tiktok_url || '',
        twitter_url: profile.twitter_url || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center mobile-safe-top">
        <div className="space-y-4 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-64 w-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark mobile-safe-bottom">

      <div className="mobile-container pt-16 pb-6 space-y-3">

        {/* Profile Header */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <ProfileImageUpload
                imageUrl={formData.profile_image}
                onImageSelect={handleImageSelect}
                disabled={updating}
              />

              {isEditing ? (
                <div className="w-full space-y-4">
                  {/* Personal Info Section */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/10 rounded-lg">
                    <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      Personal Information
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">First Name</label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        className="bg-background border-border h-8 text-sm"
                        placeholder="First Name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">Last Name</label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        className="bg-background border-border h-8 text-sm"
                        placeholder="Last Name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">Phone Number</label>
                      <Input
                        value={formData.phone_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                        className="bg-background border-border h-8 text-sm"
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground">NIN Number</label>
                      <Input
                        value={formData.nin_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, nin_number: e.target.value }))}
                        className="bg-background border-border h-8 text-sm"
                        placeholder="NIN Number"
                      />
                    </div>
                  </div>

                  {/* Artist Info Section */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Artist Details
                    </div>
                    <Input
                      value={formData.stage_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, stage_name: e.target.value }))}
                      placeholder="Stage Name"
                      className="bg-background border-border text-center font-bold"
                    />
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Artist Bio"
                      className="bg-background border-border resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground">{profile?.stage_name}</h2>
                  {profile?.bio && (
                    <p className="text-sm text-muted-foreground max-w-md">{profile.bio}</p>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <div>
                      <div className="text-base font-semibold text-foreground">0</div>
                      <div>Releases</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-foreground">
                        {profile?.created_at && new Date(profile.created_at).getFullYear()}
                      </div>
                      <div>Member Since</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Controls */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={updating} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={updating} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)} className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => profile && shareArtist(profile.stage_name, window.location.href)}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </>
          )}
        </div>

        {/* Streaming Platforms */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base text-card-foreground">Major Streaming Services</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 p-3 bg-secondary/10 rounded-lg">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Spotify Artist ID</label>
                  <Input
                    value={formData.spotify_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, spotify_id: e.target.value }))}
                    placeholder="e.g. 4Z8W4fUhv5... (from URI)"
                    className="bg-background border-border text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Apple Music Artist ID</label>
                  <Input
                    value={formData.apple_music_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, apple_music_id: e.target.value }))}
                    placeholder="e.g. 123456789"
                    className="bg-background border-border text-sm"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <StreamingPlatformCard
                name="Spotify for Artists"
                icon={<Music className="w-5 h-5" />}
                url={formData.spotify_url}
                onUpdate={(url) => setFormData(prev => ({ ...prev, spotify_url: url || '' }))}
                isEditing={isEditing}
                placeholder="https://open.spotify.com/artist/..."
              />
              <StreamingPlatformCard
                name="Apple Music"
                icon={<Music2 className="w-5 h-5" />}
                url={formData.apple_music_url}
                onUpdate={(url) => setFormData(prev => ({ ...prev, apple_music_url: url || '' }))}
                isEditing={isEditing}
                placeholder="https://music.apple.com/..."
              />
              <StreamingPlatformCard
                name="YouTube Music"
                icon={<Disc3 className="w-5 h-5" />}
                url={formData.youtube_url}
                onUpdate={(url) => setFormData(prev => ({ ...prev, youtube_url: url || '' }))}
                isEditing={isEditing}
                placeholder="https://youtube.com/@..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Platforms */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base text-card-foreground">Additional Streaming Platforms</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <StreamingPlatformCard
              name="Audiomack"
              icon={<Music className="w-5 h-5" />}
              url={formData.audiomack_url}
              onUpdate={(url) => setFormData(prev => ({ ...prev, audiomack_url: url || '' }))}
              isEditing={isEditing}
              placeholder="https://audiomack.com/..."
            />
            <StreamingPlatformCard
              name="SoundCloud"
              icon={<Music className="w-5 h-5" />}
              url={formData.soundcloud_url}
              onUpdate={(url) => setFormData(prev => ({ ...prev, soundcloud_url: url || '' }))}
              isEditing={isEditing}
              placeholder="https://soundcloud.com/..."
            />
            <StreamingPlatformCard
              name="Deezer"
              icon={<Music className="w-5 h-5" />}
              url={formData.deezer_url}
              onUpdate={(url) => setFormData(prev => ({ ...prev, deezer_url: url || '' }))}
              isEditing={isEditing}
              placeholder="https://deezer.com/..."
            />
            <StreamingPlatformCard
              name="Tidal"
              icon={<Music className="w-5 h-5" />}
              url={formData.tidal_url}
              onUpdate={(url) => setFormData(prev => ({ ...prev, tidal_url: url || '' }))}
              isEditing={isEditing}
              placeholder="https://tidal.com/..."
            />
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base text-card-foreground">Social Media</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <SocialLinkCard
              name="Instagram"
              icon={<Music className="w-5 h-5" />}
              url={formData.instagram_url}
              onUpdate={(url) => setFormData(prev => ({ ...prev, instagram_url: url || '' }))}
              isEditing={isEditing}
              placeholder="https://instagram.com/..."
            />
            <SocialLinkCard
              name="Facebook"
              icon={<Music className="w-5 h-5" />}
              url={formData.facebook_url}
              onUpdate={(url) => setFormData(prev => ({ ...prev, facebook_url: url || '' }))}
              isEditing={isEditing}
              placeholder="https://facebook.com/..."
            />
            <SocialLinkCard
              name="TikTok"
              icon={<Music className="w-5 h-5" />}
              url={formData.tiktok_url}
              onUpdate={(url) => setFormData(prev => ({ ...prev, tiktok_url: url || '' }))}
              isEditing={isEditing}
              placeholder="https://tiktok.com/@..."
            />
            <SocialLinkCard
              name="Twitter/X"
              icon={<Music className="w-5 h-5" />}
              url={formData.twitter_url}
              onUpdate={(url) => setFormData(prev => ({ ...prev, twitter_url: url || '' }))}
              isEditing={isEditing}
              placeholder="https://twitter.com/..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
