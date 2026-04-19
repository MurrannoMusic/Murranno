import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Music, Users, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { TwoTierHeader } from '@/components/layout/TwoTierHeader';
import { useArtistDetail } from '@/hooks/useArtistDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { useShare } from '@/hooks/useShare';

export default function ArtistDetail() {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const { artist, releases, labelRelation, payoutHistory, loading } = useArtistDetail(artistId!);
  const { shareArtist } = useShare();

  const handleShare = () => {
    if (artist) {
      shareArtist(artist.stage_name, window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark mobile-safe-bottom">
        <TwoTierHeader title="ARTIST DETAILS" backTo="/app/artist-management" />
        <div className="mobile-container pt-[120px] pb-6 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-dark mobile-safe-bottom">
        <TwoTierHeader title="ARTIST DETAILS" backTo="/app/artist-management" />
        <div className="mobile-container pt-[120px] pb-6 text-center">
          <p className="text-muted-foreground">Artist not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark mobile-safe-bottom">
      <TwoTierHeader 
        title="ARTIST DETAILS" 
        backTo="/app/artist-management"
        actionIcon={<Share2 className="w-4 h-4" />}
        onAction={handleShare}
      />

      <div className="mobile-container pt-[120px] pb-6 space-y-6">
      {/* Artist Header */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={artist.profile_image || ''} />
              <AvatarFallback className="text-2xl">{artist.stage_name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{artist.stage_name}</h1>
              {artist.bio && (
                <p className="text-muted-foreground mb-4">{artist.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-2">
                {artist.spotify_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={artist.spotify_url} target="_blank" rel="noopener noreferrer">Spotify</a>
                  </Button>
                )}
                {artist.apple_music_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={artist.apple_music_url} target="_blank" rel="noopener noreferrer">Apple Music</a>
                  </Button>
                )}
                {artist.instagram_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={artist.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Streams</p>
                <p className="text-2xl font-bold">{artist.totalStreams.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">₦{artist.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Music className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Releases</p>
                <p className="text-2xl font-bold">{artist.releaseCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {labelRelation && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Share</p>
                  <p className="text-2xl font-bold">{labelRelation.revenue_share_percentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Releases */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Releases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {releases.map(release => (
                <div key={release.id} className="flex items-center gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                  <img 
                    src={release.cover_art_url || '/placeholder.svg'} 
                    alt={release.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{release.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(release.release_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{release.streams.toLocaleString()} streams</p>
                    <p className="text-sm text-muted-foreground">₦{release.earnings.toFixed(2)}</p>
                  </div>
                  <Badge variant={release.status === 'Live' ? 'default' : 'secondary'}>
                    {release.status}
                  </Badge>
                </div>
              ))}
              {releases.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No releases yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contract & Payout Info */}
        <div className="space-y-6">
          {labelRelation && (
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Share</p>
                  <p className="text-lg font-semibold">{labelRelation.revenue_share_percentage}%</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="default">{labelRelation.status}</Badge>
                </div>
                {labelRelation.contract_start_date && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Contract Period</p>
                      <p className="text-sm">
                        {new Date(labelRelation.contract_start_date).toLocaleDateString()}
                        {labelRelation.contract_end_date && ` - ${new Date(labelRelation.contract_end_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </>
                )}
                {labelRelation.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{labelRelation.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {payoutHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payoutHistory.map((payout, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-accent/50">
                      <div>
                        <p className="font-medium">₦{payout.amount}</p>
                        <p className="text-xs text-muted-foreground">{payout.period}</p>
                      </div>
                      <Badge variant={payout.status === 'Completed' ? 'default' : 'secondary'}>
                        {payout.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
