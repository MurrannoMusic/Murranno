export type CampaignStatus = 
  | 'Draft' 
  | 'Pending Payment' 
  | 'Paid' 
  | 'In Review' 
  | 'Active' 
  | 'Paused' 
  | 'Completed' 
  | 'Rejected' 
  | 'Cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface CampaignAsset {
  type: 'logo' | 'image' | 'video' | 'presskit' | 'other';
  url: string;
  publicId: string;
  name: string;
}

export interface TargetAudience {
  ageRange?: string;
  locations?: string[];
  genres?: string[];
  interests?: string[];
}

export interface SocialLinks {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  audiomack?: string;
  soundcloud?: string;
  deezer?: string;
  tidal?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
  website?: string;
}

export interface Campaign {
  id: string;
  name: string;
  artist: string;
  platform: string;
  status: CampaignStatus;
  budget: string;
  spent: string;
  reach: string;
  engagement: string;
  startDate: string;
  endDate?: string;
  type: 'TikTok' | 'Instagram' | 'YouTube' | 'Spotify' | 'Multi-Platform';
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  paymentAmount?: number;
  campaignAssets?: CampaignAsset[];
  campaignBrief?: string;
  targetAudience?: TargetAudience;
  socialLinks?: SocialLinks;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpent: string;
  totalReach: string;
}