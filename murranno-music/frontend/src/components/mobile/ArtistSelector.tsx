import { ChevronDown, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserType } from '@/hooks/useUserType';

export const ArtistSelector = () => {
  const { currentUser, selectedArtist, selectArtist, isLabel } = useUserType();

  if (!isLabel || !('artists' in currentUser)) return null;

  const artists = currentUser.artists;

  return (
    <div className="mb-4">
      <Select value={selectedArtist || 'all'} onValueChange={(value) => selectArtist(value === 'all' ? null : value)}>
        <SelectTrigger className="w-full glass-card border-border/20">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {selectedArtist 
                  ? artists.find(a => a.id === selectedArtist)?.name.charAt(0)
                  : 'All'
                }
              </AvatarFallback>
            </Avatar>
            <SelectValue placeholder="Select Artist" />
          </div>
        </SelectTrigger>
        <SelectContent className="glass-card border-border/20">
          <SelectItem value="all">
            <div className="flex items-center gap-3">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-muted text-xs">All</AvatarFallback>
              </Avatar>
              <span>All Artists</span>
            </div>
          </SelectItem>
          {artists.map((artist) => (
            <SelectItem key={artist.id} value={artist.id}>
              <div className="flex items-center gap-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={artist.profileImage} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {artist.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{artist.stageName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};