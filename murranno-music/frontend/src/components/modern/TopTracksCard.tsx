import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  plays: string;
  change: string;
  changeType: 'positive' | 'negative';
}

interface TopTracksCardProps {
  tracks: Track[];
}

export const TopTracksCard = ({ tracks }: TopTracksCardProps) => {
  return (
    <Card className="bg-card border border-border rounded-[20px] shadow-soft">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-card-foreground flex items-center gap-3">
          <Music className="h-5 w-5 text-primary" />
          Top Tracks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tracks.map((track) => (
          <div key={track.id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-[16px] border border-border hover:bg-secondary/30 transition-all duration-200 cursor-pointer">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-card-foreground truncate">{track.name}</p>
                <div className="text-right">
                  <p className="text-sm font-bold text-card-foreground">{track.plays}</p>
                  <span className={`text-xs font-medium ${
                    track.changeType === 'positive' ? 'text-success' : 'text-destructive'
                  }`}>
                    {track.change}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">plays this week</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};