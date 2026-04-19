import { User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface ArtistFilterProps {
  selectedArtist: string;
  onArtistChange: (value: string) => void;
  artists: Array<{ id: string; name: string; stageName: string }>;
}

export const ArtistFilter = ({ selectedArtist, onArtistChange, artists }: ArtistFilterProps) => {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedArtist} onValueChange={onArtistChange}>
            <SelectTrigger className="flex-1 bg-muted/20 border-border/20">
              <SelectValue placeholder="Filter by artist" />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/20">
              <SelectItem value="all">All Artists</SelectItem>
              {artists.map((artist) => (
                <SelectItem key={artist.id} value={artist.stageName}>
                  {artist.stageName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};