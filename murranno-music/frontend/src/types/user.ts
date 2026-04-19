export type UserType = 'artist' | 'label' | 'agency' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  accountType: UserType;
  profileImage?: string;
}

export interface Artist {
  id: string;
  name: string;
  stageName: string;
  profileImage?: string;
  labelId?: string;
  isActive: boolean;
}

export interface Label extends User {
  accountType: 'label';
  artists: Artist[];
  companyName: string;
}

export interface Agency extends User {
  accountType: 'agency';
  companyName: string;
  clientArtists: string[]; // Artist IDs they manage campaigns for
}