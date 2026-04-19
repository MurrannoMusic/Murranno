import { User, Music, Check, Edit2 } from 'lucide-react';
import mmLogo from "@/assets/mm_logo.png";
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { useUserType } from '@/hooks/useUserType';
import { useToast } from '@/hooks/use-toast';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { supabase } from '@/integrations/supabase/client';

export const Profile = () => {
  const { currentUser } = useUserType();
  const { toast } = useToast();
  const { profile, uploadProfileImage } = useArtistProfile();

  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState(profile?.spotify_url || '');
  const [appleMusicUrl, setAppleMusicUrl] = useState(profile?.apple_music_url || '');
  const [errors, setErrors] = useState({ spotify: '', appleMusic: '' });

  const validateUrls = () => {
    const newErrors = { spotify: '', appleMusic: '' };
    let isValid = true;

    if (spotifyUrl && !spotifyUrl.startsWith('https://open.spotify.com/')) {
      newErrors.spotify = 'Spotify URL must start with https://open.spotify.com/';
      isValid = false;
    }

    if (appleMusicUrl && !appleMusicUrl.startsWith('https://music.apple.com/')) {
      newErrors.appleMusic = 'Apple Music URL must start with https://music.apple.com/';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveLinks = async () => {
    if (validateUrls()) {
      try {
        const { data, error } = await supabase.functions.invoke('update-artist-profile', {
          body: {
            spotify_url: spotifyUrl || null,
            apple_music_url: appleMusicUrl || null,
          }
        });

        if (error) throw error;

        setIsEditingLinks(false);
        toast({
          title: "Links saved successfully",
          description: "Your streaming profile links have been updated.",
        });
      } catch (error: any) {
        console.error('Error saving links:', error);
        toast({
          title: "Failed to save links",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditLinks = () => {
    setSpotifyUrl(profile?.spotify_url || '');
    setAppleMusicUrl(profile?.apple_music_url || '');
    setIsEditingLinks(true);
    setErrors({ spotify: '', appleMusic: '' });
  };

  const handleImageSelect = async (file: File) => {
    setIsUploadingImage(true);
    try {
      await uploadProfileImage(file);
      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        {/* Top Bar removed - using UnifiedTopBar */}
        <div className="mobile-container space-y-4 mt-4">
          <Card className="bg-card border border-border rounded-[20px] shadow-soft">
            <CardContent className="p-6 text-center space-y-2">
              <p className="text-muted-foreground">No profile loaded.</p>
              {/* <Link to="/app/user-type-selection" className="text-primary hover:underline">Select user type</Link> */}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="smooth-scroll">
      {/* Top Bar removed - using UnifiedTopBar */}

      <div className="mobile-container space-y-3 mt-2 pb-16">
        <Card className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Artist Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg border border-border/50">
              <ProfileImageUpload
                imageUrl={profile?.profile_image || currentUser?.avatar}
                onImageSelect={handleImageSelect}
                disabled={isUploadingImage}
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-card-foreground truncate">{currentUser?.name ?? 'Artist Name'}</h2>
                <div className="flex flex-col mt-0.5">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    {currentUser?.accountType || 'Artist'}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">{currentUser?.email ?? ''}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border rounded-xl shadow-soft">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-bold text-card-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                Streaming Links
              </div>
              {!isEditingLinks && (profile?.spotify_url || profile?.apple_music_url) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditLinks}
                  className="h-7 w-7 p-0 text-primary hover:text-primary/80"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {!isEditingLinks && !profile?.spotify_url && !profile?.apple_music_url ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground mb-3">Connect your profiles to help us track your stats</p>
                <Button onClick={handleEditLinks} variant="outline" size="sm" className="h-8 text-xs">
                  Add Streaming Links
                </Button>
              </div>
            ) : isEditingLinks ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="spotify" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Spotify Profile
                  </Label>
                  <Input
                    id="spotify"
                    type="url"
                    placeholder="https://open.spotify.com/artist/..."
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    className="h-8 text-xs bg-background border-border rounded-lg"
                  />
                  {errors.spotify && (
                    <p className="text-[10px] text-destructive ml-1">{errors.spotify}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="appleMusic" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Apple Music Profile
                  </Label>
                  <Input
                    id="appleMusic"
                    type="url"
                    placeholder="https://music.apple.com/..."
                    value={appleMusicUrl}
                    onChange={(e) => setAppleMusicUrl(e.target.value)}
                    className="h-8 text-xs bg-background border-border rounded-lg"
                  />
                  {errors.appleMusic && (
                    <p className="text-[10px] text-destructive ml-1">{errors.appleMusic}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSaveLinks} size="sm" className="flex-1 h-8 text-xs">
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingLinks(false);
                      setErrors({ spotify: '', appleMusic: '' });
                    }}
                    className="flex-1 h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {profile?.spotify_url && (
                  <div className="p-2.5 bg-secondary/10 rounded-lg border border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Spotify</p>
                    <a
                      href={profile.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all font-medium"
                    >
                      {profile.spotify_url}
                    </a>
                  </div>
                )}
                {profile?.apple_music_url && (
                  <div className="p-2.5 bg-secondary/10 rounded-lg border border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Apple Music</p>
                    <a
                      href={profile.apple_music_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all font-medium"
                    >
                      {profile.apple_music_url}
                    </a>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};