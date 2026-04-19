export type PromotionCategory = 
  | 'Streaming & Playlist Promotion'
  | 'Digital & Social Media Marketing'
  | 'Press & Media Promotions'
  | 'Radio Promotions'
  | 'Interviews & Appearances'
  | 'Events & Experiences'
  | 'Direct Marketing';

export interface PromotionService {
  id: string;
  name: string;
  category: PromotionCategory;
  description?: string;
  price: number;
  duration?: string;
  features?: string[];
  imageUrl?: string;
  images?: string[];
  videos?: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionBundle {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  tierLevel: number;
  targetDescription?: string;
  imageUrl?: string;
  includedServices?: PromotionService[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignService {
  id: string;
  campaignId: string;
  serviceId: string;
  status: 'pending' | 'in_progress' | 'completed';
  service?: PromotionService;
  createdAt: string;
  updatedAt: string;
}
