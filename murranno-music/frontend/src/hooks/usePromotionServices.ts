import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PromotionService, PromotionCategory } from '@/types/promotion';

export const usePromotionServices = (category?: PromotionCategory) => {
  const [services, setServices] = useState<PromotionService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    fetchServices();
  }, [category]);

  const fetchServices = async () => {
    try {
      setError(null);
      setLoading(true);
      let query = supabase
        .from('promotion_services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedServices: PromotionService[] = (data || []).map(service => ({
        id: service.id,
        name: service.name,
        category: service.category as PromotionCategory,
        description: service.description,
        price: Number(service.price),
        duration: service.duration,
        features: service.features as string[],
        imageUrl: service.image_url,
        images: service.images as string[] || [],
        videos: service.videos as string[] || [],
        isActive: service.is_active,
        sortOrder: service.sort_order,
        createdAt: service.created_at,
        updatedAt: service.updated_at,
      }));

      setServices(formattedServices);
    } catch (error: any) {
      setError(error);
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories: PromotionCategory[] = [
    'Streaming & Playlist Promotion',
    'Digital & Social Media Marketing',
    'Press & Media Promotions',
    'Radio Promotions',
    'Interviews & Appearances',
    'Events & Experiences',
    'Direct Marketing',
  ];

  return {
    error,
    services,
    loading,
    categories,
    refetch: fetchServices,
  };
};
