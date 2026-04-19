export interface StatItem {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

export interface ArtistStats {
  streams: string;
  earnings: string;
  followers: string;
  releases: string;
}

export interface LabelStats extends ArtistStats {
  totalArtists: number;
  totalReleases: number;
  combinedRevenue: string;
}