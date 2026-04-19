export type ReleaseType = 'Single' | 'Album' | 'EP';
export type ReleaseStatus = 'Live' | 'Repair' | 'Takedown';

export interface ReleaseMetadata {
  genre: string;
  language: string;
  label: string;
  copyright: string;
  upcEan: string;
}

export interface Release {
  id: string;
  title: string;
  artist: string;
  type: ReleaseType;
  year: number;
  releaseDate: string;
  coverArt: string;
  status: ReleaseStatus;
  metadata: ReleaseMetadata;
  smartlink: string;
}
