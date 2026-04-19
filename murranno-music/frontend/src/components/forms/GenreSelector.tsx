import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const GENRES = [
  'Afrobeats', 'Pop', 'R&B', 'Rock', 'Hip-Hop', 'Afrobeat', 'Reggae', 'Dancehall', 
  'Amapiano', 'Highlife', 'Fuji', 'Juju', 'Alternative Rock', 'Indie', 'Jazz', 
  'Blues', 'Soul', 'Gospel', 'Country', 'Folk', 'Classical', 'Opera', 'EDM', 
  'House', 'Techno', 'Trance', 'Drum and Bass', 'Dubstub', 'Trap', 'Drill', 
  'Grime', 'K-Pop', 'J-Pop', 'Latin Pop', 'Reggaeton', 'Salsa', 'Merengue', 
  'Bachata', 'Ska', 'Punk', 'Metal', 'Funk', 'Disco', 'Lo-fi', 'Chillwave', 
  'Synthpop', 'Ambient', 'Soundtrack', 'World Music', 'Afro-Fusion', 
  'Experimental', 'Alternative', 'Afro Fusion', 'Afro Fuji', 'Afro House', 
  'Electric', 'Other'
];

interface GenreSelectorProps {
  primaryGenre: string;
  secondaryGenre: string;
  customPrimaryGenre: string;
  customSecondaryGenre: string;
  onPrimaryGenreChange: (value: string) => void;
  onSecondaryGenreChange: (value: string) => void;
  onCustomPrimaryGenreChange: (value: string) => void;
  onCustomSecondaryGenreChange: (value: string) => void;
}

export const GenreSelector = ({
  primaryGenre,
  secondaryGenre,
  customPrimaryGenre,
  customSecondaryGenre,
  onPrimaryGenreChange,
  onSecondaryGenreChange,
  onCustomPrimaryGenreChange,
  onCustomSecondaryGenreChange,
}: GenreSelectorProps) => {
  return (
    <div className="space-y-4">
      {/* Primary Genre */}
      <div>
        <Label htmlFor="primary-genre" className="text-sm font-medium text-muted-foreground mb-2 block">
          Primary Genre <span className="text-destructive">*</span>
        </Label>
        <Select value={primaryGenre} onValueChange={onPrimaryGenreChange} required>
          <SelectTrigger id="primary-genre" className="w-full bg-input border-border rounded-[12px]">
            <SelectValue placeholder="Select primary genre" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] bg-popover border-border">
            {GENRES.map((genre) => (
              <SelectItem key={genre} value={genre} className="cursor-pointer">
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {primaryGenre === 'Other' && (
          <div className="mt-3">
            <Input
              id="custom-primary-genre"
              value={customPrimaryGenre}
              onChange={(e) => onCustomPrimaryGenreChange(e.target.value)}
              placeholder="Enter your genre"
              className="w-full bg-input border-border rounded-[12px]"
              required
            />
          </div>
        )}
      </div>

      {/* Secondary Genre */}
      <div>
        <Label htmlFor="secondary-genre" className="text-sm font-medium text-muted-foreground mb-2 block">
          Secondary Genre <span className="text-xs text-muted-foreground/60">(Optional)</span>
        </Label>
        <Select value={secondaryGenre} onValueChange={onSecondaryGenreChange}>
          <SelectTrigger id="secondary-genre" className="w-full bg-input border-border rounded-[12px]">
            <SelectValue placeholder="Select secondary genre" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] bg-popover border-border">
            <SelectItem value="none" className="cursor-pointer">
              None
            </SelectItem>
            {GENRES.map((genre) => (
              <SelectItem key={genre} value={genre} className="cursor-pointer">
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {secondaryGenre === 'Other' && (
          <div className="mt-3">
            <Input
              id="custom-secondary-genre"
              value={customSecondaryGenre}
              onChange={(e) => onCustomSecondaryGenreChange(e.target.value)}
              placeholder="Enter your genre"
              className="w-full bg-input border-border rounded-[12px]"
            />
          </div>
        )}
      </div>
    </div>
  );
};
