import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PromotionBundle, PromotionService, PromotionCategory } from '@/types/promotion';
import { toast } from 'sonner';

export const usePromotionBundles = () => {
  const [bundles, setBundles] = useState<PromotionBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      
      // Fetch bundles
      const { data: bundlesData, error: bundlesError } = await supabase
        .from('promotion_bundles')
        .select('*')
        .eq('is_active', true)
        .order('tier_level');

      if (bundlesError) throw bundlesError;

      // Fetch all bundle services with service details
      const bundleIds = bundlesData?.map(b => b.id) || [];
      const { data: bundleServicesData, error: servicesError } = await supabase
        .from('bundle_services')
        .select(`
          bundle_id,
          promotion_services (*)
        `)
        .in('bundle_id', bundleIds);

      if (servicesError) throw servicesError;

      // Map services to bundles
      const formattedBundles: PromotionBundle[] = (bundlesData || []).map(bundle => {
        const bundleServices = bundleServicesData
          ?.filter((bs: any) => bs.bundle_id === bundle.id)
          .map((bs: any) => ({
            id: bs.promotion_services.id,
            name: bs.promotion_services.name,
            category: bs.promotion_services.category as PromotionCategory,
            description: bs.promotion_services.description,
            price: Number(bs.promotion_services.price),
            duration: bs.promotion_services.duration,
            features: bs.promotion_services.features as string[],
            imageUrl: bs.promotion_services.image_url,
            isActive: bs.promotion_services.is_active,
            sortOrder: bs.promotion_services.sort_order,
            createdAt: bs.promotion_services.created_at,
            updatedAt: bs.promotion_services.updated_at,
          })) || [];

        return {
          id: bundle.id,
          name: bundle.name,
          slug: bundle.slug,
          description: bundle.description,
          price: Number(bundle.price),
          tierLevel: bundle.tier_level,
          targetDescription: bundle.target_description,
          imageUrl: bundle.image_url,
          includedServices: bundleServices,
          isActive: bundle.is_active,
          createdAt: bundle.created_at,
          updatedAt: bundle.updated_at,
        };
      });

      setBundles(formattedBundles);
    } catch (error: any) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load promotional bundles');
    } finally {
      setLoading(false);
    }
  };

  return {
    bundles,
    loading,
    refetch: fetchBundles,
  };
};
