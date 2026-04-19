import { ArrowLeft, Users, TrendingUp, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArtistSelector } from '@/components/mobile/ArtistSelector';
import { useUserType } from '@/hooks/useUserType';
import { PageContainer } from '@/components/layout/PageContainer';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { useArtists } from '@/hooks/useArtists';

export const LabelAnalytics = () => {
  const { selectedArtist, currentUser, isLabel } = useUserType();
  const { artists, loading } = useArtists();

  const topArtists = artists
    .sort((a, b) => parseFloat(b.streams.replace(/[K|M]/g, '')) - parseFloat(a.streams.replace(/[K|M]/g, '')))
    .slice(0, 3);

  return (
    <PageContainer>
      {/* Top Bar removed - using UnifiedTopBar */}

      <div className="mobile-container space-y-4 -mt-2">
        {/* Artist Selector for Labels */}
        {isLabel && <ArtistSelector />}

        {/* Crypto-style Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-[20px] shadow-soft p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-card-foreground">{artists.length}</div>
              <div className="text-xs text-muted-foreground font-medium">Total Artists</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[20px] shadow-soft p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Music className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-card-foreground">
                {artists.reduce((sum, a) => sum + a.releases, 0)}
              </div>
              <div className="text-xs text-muted-foreground font-medium">Total Releases</div>
            </div>
          </div>
        </div>

        {/* Top Artists */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Performing Artists
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : topArtists.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No artists yet</p>
            ) : (
              topArtists.map(artist => (
                <div key={artist.id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-[16px] border border-border hover:bg-secondary/30 transition-all duration-200 cursor-pointer">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-card-foreground truncate">{artist.stage_name}</p>
                      <span className="text-sm font-bold text-card-foreground">{artist.streams} streams</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{artist.releases} releases • {artist.revenue} earned</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Analytics Tools */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground">Analytics Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-3 rounded-[16px] transition-all duration-200 shadow-primary hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98] text-xs">
                Generate Report
              </button>

              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-4 px-3 rounded-[16px] transition-all duration-200 text-xs">
                Export Data
              </button>
            </div>

            <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-4 px-4 rounded-[16px] transition-all duration-200 text-xs">
              View Detailed Metrics
            </button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};