import { Edit, MoreVertical, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Artist {
  id: string;
  name: string;
  stageName: string;
  status: string;
  releases: number;
  streams: string;
  revenue: string;
}

interface ArtistCardProps {
  artist: Artist;
  onEdit?: (id: string) => void;
  onViewReleases?: (id: string) => void;
  onViewAnalytics?: (id: string) => void;
  onManagePayouts?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export const ArtistCard = ({ 
  artist, 
  onEdit, 
  onViewReleases, 
  onViewAnalytics, 
  onManagePayouts,
  onViewDetails
}: ArtistCardProps) => {
  return (
    <div className="interactive-element p-4 bg-muted/20 rounded-xl border border-border/10">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
            {artist.stageName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{artist.stageName}</h3>
            <Badge variant="secondary" className="text-xs">
              {artist.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{artist.name}</p>
          
          <div className="flex gap-4 mt-2 text-xs">
            <span><strong>{artist.releases}</strong> releases</span>
            <span><strong>{artist.streams}</strong> streams</span>
            <span className="text-primary font-semibold">{artist.revenue}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card border-border/20">
            {onViewDetails && (
              <DropdownMenuItem onClick={() => onViewDetails(artist.id)}>
                View Details
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit?.(artist.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewReleases?.(artist.id)}>
              <Music className="h-4 w-4 mr-2" />
              View Releases
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewAnalytics?.(artist.id)}>
              View Analytics
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManagePayouts?.(artist.id)}>
              Manage Payouts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};