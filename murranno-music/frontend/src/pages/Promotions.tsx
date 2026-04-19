import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import mmLogo from "@/assets/mm_logo.png";
import promotionsHeroBg from '@/assets/promotions-hero-bg.jpg';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { ServiceCard } from '@/components/promotions/ServiceCard';
import { BundleCard } from '@/components/promotions/BundleCard';
import { CategoryFilter } from '@/components/promotions/CategoryFilter';
import { CampaignCreationWizard } from '@/components/promotions/CampaignCreationWizard';
import { CartButton } from '@/components/promotions/CartButton';
import { CartDrawer } from '@/components/promotions/CartDrawer';
import { usePromotionServices } from '@/hooks/usePromotionServices';
import { usePromotionBundles } from '@/hooks/usePromotionBundles';
import { CartProvider } from '@/contexts/CartContext';
import { useCart } from '@/hooks/useCart';
import { PromotionService, PromotionBundle, PromotionCategory } from '@/types/promotion';

const PromotionsContent = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<PromotionCategory | 'all'>('all');
  const [selectedService, setSelectedService] = useState<PromotionService | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<PromotionBundle | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCampaignDialogOpen, setCartCampaignDialogOpen] = useState(false);

  const { services, loading: servicesLoading, categories } = usePromotionServices();
  const { bundles, loading: bundlesLoading } = usePromotionBundles();
  const { items: cartItems } = useCart();

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const serviceCounts = {
    all: services.length,
    ...categories.reduce((acc, cat) => ({
      ...acc,
      [cat]: services.filter(s => s.category === cat).length
    }), {})
  };

  const handleServiceSelect = (service: PromotionService) => {
    setSelectedService(service);
  };

  const handleBundleSelect = (bundle: PromotionBundle) => {
    setSelectedBundle(bundle);
  };

  const handleCartCreateCampaign = () => {
    setCartCampaignDialogOpen(true);
  };

  const handleSelectBundleFromCart = (bundle: PromotionBundle) => {
    setCartOpen(false);
    setSelectedBundle(bundle);
  };

  return (
    <>
      <CartButton onClick={() => setCartOpen(true)} />
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCreateCampaign={handleCartCreateCampaign}
        onSelectBundle={handleSelectBundleFromCart}
      />

      <div className="smooth-scroll px-4 md:px-6">
        {/* Top Bar removed - using UnifiedTopBar */}

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl mb-5 group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${promotionsHeroBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent backdrop-blur-[1px]" />
          <div className="relative p-6 md:p-8 text-white flex flex-col items-start justify-center min-h-[160px]">
            <Badge className="mb-2 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md text-[10px] px-2 py-0.5">
              Premium Services
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 drop-shadow-lg tracking-tight">
              Amplify Your Sound
            </h1>
            <p className="text-gray-200 text-xs md:text-sm max-w-sm mb-4 leading-relaxed">
              Professional promotional campaigns designed to get your music the attention it deserves.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/app/campaign-tracking')}
              className="bg-white text-black hover:bg-white/90 font-bold shadow-xl border-none h-8 text-xs"
            >
              Track Active Campaigns
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bundles" className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-secondary/30 backdrop-blur-sm border border-white/5 p-1 h-9 rounded-full">
              <TabsTrigger
                value="bundles"
                className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                Featured Junkets
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                All Services
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Promotional Junkets Tab */}
          <TabsContent value="bundles" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-2">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Curated Impact Bundles</h2>
                <p className="text-muted-foreground text-xs">
                  Complete promotional packages tailored for your growth stage
                </p>
              </div>
            </div>

            {bundlesLoading ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-1">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="h-[350px] animate-pulse bg-muted/50 rounded-2xl border-none" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-1">
                {bundles.map((bundle, index) => (
                  <BundleCard
                    key={bundle.id}
                    bundle={bundle}
                    onSelect={handleBundleSelect}
                    isRecommended={index === 1} // Recommend Growth Junket
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Individual Services Tab */}
          <TabsContent value="services" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Build Your Strategy</h2>
                  <p className="text-muted-foreground text-xs">
                    Select individual services to customize your campaign
                  </p>
                </div>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  serviceCounts={serviceCounts}
                />
              </div>

              {servicesLoading ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-1">
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="h-72 animate-pulse bg-muted/50 rounded-2xl border-none" />
                  ))}
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/5 rounded-2xl border border-dashed border-border/50 mx-1">
                  <Megaphone className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <h3 className="text-base font-semibold text-foreground">No services found</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Try adjusting your filters or check back later for new promotional options.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-1">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onSelect={handleServiceSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Campaign Creation Wizard */}
        {selectedService && (
          <CampaignCreationWizard
            open={!!selectedService}
            onOpenChange={(open) => !open && setSelectedService(null)}
            service={selectedService}
            onSuccess={() => setSelectedService(null)}
          />
        )}

        {selectedBundle && (
          <CampaignCreationWizard
            open={!!selectedBundle}
            onOpenChange={(open) => !open && setSelectedBundle(null)}
            bundle={selectedBundle}
            onSuccess={() => setSelectedBundle(null)}
          />
        )}

        {cartCampaignDialogOpen && (
          <CampaignCreationWizard
            open={cartCampaignDialogOpen}
            onOpenChange={setCartCampaignDialogOpen}
            services={cartItems.map(item => item.service)}
            onSuccess={() => {
              setCartCampaignDialogOpen(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export const Promotions = () => {
  return (
    <CartProvider>
      <PromotionsContent />
    </CartProvider>
  );
};
