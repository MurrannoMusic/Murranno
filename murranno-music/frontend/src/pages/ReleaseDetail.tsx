import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SlidersHorizontal, Share2, ExternalLink, Music, DollarSign, Play, Copy } from 'lucide-react';
import { CloudinaryImage } from '@/components/ui/cloudinary-image';
import { useReleaseDetail } from '@/hooks/useReleaseDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { useShare } from '@/hooks/useShare';
import { useClipboard } from '@/hooks/useClipboard';
import { TwoTierHeader } from '@/components/layout/TwoTierHeader';


const statusColors: Record<string, string> = {
  Live: 'bg-green-500 text-white',
  Published: 'bg-green-500 text-white',
  Draft: 'bg-gray-500 text-white',
  Repair: 'bg-yellow-500 text-white',
  Takedown: 'bg-red-500 text-white'
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatNumber = (num: number | undefined | null): string => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

interface MetadataRowProps {
  label: string;
  value: string | number | null | undefined;
}

const MetadataRow = ({ label, value }: MetadataRowProps) => (
  <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium text-right truncate pl-4">
      {value || '-'}
    </span>
  </div>
);

const ReleaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { release, loading } = useReleaseDetail(id);
  const { shareUrl } = useShare();
  const { copySmartlink } = useClipboard();


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark mobile-safe-bottom">
        <TwoTierHeader title="RELEASE DETAILS" backTo="/app/releases" />
        <div className="mobile-container pt-[120px] pb-6 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="min-h-screen bg-gradient-dark mobile-safe-bottom">
        <TwoTierHeader title="RELEASE DETAILS" backTo="/app/releases" />
        <div className="mobile-container pt-[120px] pb-6 text-center">
          <p className="text-muted-foreground">This release could not be found.</p>
          <Button onClick={() => navigate('/app/releases')} className="mt-4">
            Back to Releases
          </Button>
        </div>
      </div>
    );
  }


  const handleShareSmartlink = async () => {
    const smartlink = release.smartlink || window.location.href;
    await shareUrl(
      smartlink,
      release.title,
      `Check out ${release.title} by ${release.artist_name}`
    );
  };

  const handleFilterInAnalytics = () => {
    navigate(`/app/analytics?release=${release.id}`);
  };


  const getPublicIdFromUrl = (url: string | null) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    const parts = url.split('/upload/');
    if (parts.length > 1) {
      const pathParts = parts[1].split('/');
      const publicIdParts = pathParts.filter(p => !p.startsWith('v'));
      return publicIdParts.join('/').replace(/\.[^/.]+$/, '');
    }
    return null;
  };

  const coverArtPublicId = getPublicIdFromUrl(release.cover_art_url);

  return (
    <div className="min-h-screen bg-gradient-dark mobile-safe-bottom">
      <TwoTierHeader
        title="RELEASE DETAILS"
        backTo="/app/releases"
        actionIcon={<Share2 className="w-4 h-4" />}
        onAction={handleShareSmartlink}
      />

      <div className="pt-[100px] pb-16">
        {/* Hero Section with Blurred Background */}
        <div
          className="relative min-h-[320px] flex items-center justify-center px-4 py-8"
          style={{
            backgroundImage: coverArtPublicId || !release.cover_art_url ? 'none' : `url(${release.cover_art_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Blur Overlay */}
          <div className="absolute inset-0 backdrop-blur-3xl bg-black/60" />
          {coverArtPublicId && (
            <div className="absolute inset-0 opacity-50">
              <CloudinaryImage
                publicId={coverArtPublicId}
                alt={release.title}
                width={1920}
                height={1080}
                className="w-full h-full object-cover blur-3xl"
              />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 text-center max-w-md">
            {/* Album Art */}
            <div className="relative inline-block mb-4">
              {coverArtPublicId ? (
                <CloudinaryImage
                  publicId={coverArtPublicId}
                  alt={release.title}
                  width={160}
                  height={160}
                  className="w-40 h-40 rounded-xl shadow-2xl"
                />
              ) : release.cover_art_url ? (
                <img
                  src={release.cover_art_url}
                  alt={release.title}
                  className="w-40 h-40 rounded-xl shadow-2xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-xl shadow-2xl bg-primary/20 flex items-center justify-center">
                  <Music className="h-12 w-16 text-primary" />
                </div>
              )}
              <Badge
                className={`absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0 ${statusColors[release.status]} border-0`}
              >
                {release.status}
              </Badge>
            </div>

            {/* Release Info */}
            <h1 className="text-2xl font-bold text-white mb-1">{release.title}</h1>
            <p className="text-white/90 text-sm mb-1 uppercase tracking-widest font-semibold">
              {release.artist_name}
            </p>
            <p className="text-white/70 text-[10px] uppercase font-bold tracking-tighter">
              {release.release_type} • Released {new Date(release.release_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mobile-container space-y-3 mt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <Card className="bg-card border border-border rounded-xl shadow-soft">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-card-foreground leading-tight">{formatNumber(release.total_streams || 0)}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Streams</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-soft">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-card-foreground leading-tight">₦{(release.total_earnings || 0).toFixed(0)}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tracks List */}
          {release.tracks.length > 0 && (
            <Card className="bg-card border border-border rounded-xl shadow-soft">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary" />
                  Tracks ({release.tracks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 p-3 pt-0">
                {release.tracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between p-2.5 bg-secondary/10 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4">{track.track_number}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-card-foreground truncate">{track.title}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{formatNumber(track.streams || 0)} streams</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{formatDuration(track.duration)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Metadata Section */}
          <div className="bg-card border border-border rounded-xl shadow-soft p-4">
            <h2 className="text-[10px] font-bold text-muted-foreground mb-3 tracking-widest uppercase">
              METADATA
            </h2>
            <div className="space-y-0.5">
              <MetadataRow label="Genre" value={release.genre} />
              <MetadataRow label="Language" value={release.language} />
              <MetadataRow label="Label" value={release.label} />
              <MetadataRow label="Recording Year" value={release.recording_year} />
              <MetadataRow label="Copyright" value={release.copyright} />
              <MetadataRow label="UPC/EAN" value={release.upc_ean} />
              <MetadataRow label="ISRC" value={release.isrc} />
            </div>
          </div>

          {/* Smartlink Section */}
          {release.smartlink && (
            <div className="bg-card border border-border rounded-xl shadow-soft p-4">
              <h2 className="text-[10px] font-bold text-muted-foreground mb-3 tracking-widest uppercase">
                SMARTLINK
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href={release.smartlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline break-all flex-1 font-medium"
                >
                  {release.smartlink}
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copySmartlink(release.smartlink!)}
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={handleFilterInAnalytics}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 text-xs font-bold"
            >
              <SlidersHorizontal className="mr-1.5 h-4 w-4" />
              Analytics
            </Button>
            <Button
              onClick={handleShareSmartlink}
              variant="outline"
              className="w-full rounded-xl h-10 text-xs font-bold border-border/50"
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              Share link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseDetail;
