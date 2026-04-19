import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useReleases } from '@/hooks/useReleases';
import { useCart } from '@/hooks/useCart';
import { PromotionService, PromotionBundle } from '@/types/promotion';
import { Check } from 'lucide-react';

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: PromotionService;
  bundle?: PromotionBundle;
  services?: PromotionService[];
  onSuccess?: () => void;
}

export const CampaignDialog = ({ open, onOpenChange, service, bundle, services, onSuccess }: CampaignDialogProps) => {
  const { toast } = useToast();
  const { releases } = useReleases();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  const isCartMode = services && services.length > 0;
  const totalCartPrice = services?.reduce((sum, s) => sum + s.price, 0) || 0;
  const price = isCartMode ? totalCartPrice : (service?.price || bundle?.price || 0);
  const name = isCartMode ? `${services.length} Services` : (service?.name || bundle?.name || '');
  
  const [formData, setFormData] = useState({
    campaignName: '',
    releaseId: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.releaseId) {
      toast({
        title: "Please select a release",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const campaignData = {
        name: formData.campaignName || `${name} Campaign`,
        type: bundle ? bundle.slug : service?.category || 'custom',
        platform: bundle ? 'Multi-Platform' : service?.category || 'Multi-Platform',
        release_id: formData.releaseId,
        budget: price,
        start_date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        promotion_type: bundle ? 'bundle' : 'individual',
        bundle_id: bundle?.id,
        category: service?.category,
      };

      const { data, error } = await supabase.functions.invoke('create-campaign', {
        body: campaignData
      });

      if (error) throw error;

      // Link services to campaign
      if (data?.campaign?.id) {
        const servicesToLink = services || (service ? [service] : []);
        
        if (servicesToLink.length > 0) {
          const { error: serviceError } = await supabase
            .from('campaign_services')
            .insert(
              servicesToLink.map(s => ({
                campaign_id: data.campaign.id,
                service_id: s.id,
                status: 'pending'
              }))
            );

          if (serviceError) {
            console.error('Error linking services:', serviceError);
          }
        }
      }

      // Clear cart if creating from cart
      if (isCartMode) {
        clearCart();
      }

      toast({
        title: "Campaign created",
        description: "Your campaign has been created. Proceed to payment to activate.",
      });

      onOpenChange(false);
      onSuccess?.();
      setFormData({ campaignName: '', releaseId: '' });
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Failed to create campaign",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Create Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Package Info */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-semibold text-card-foreground">{name}</p>
                {service && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {service.category}
                  </Badge>
                )}
                {bundle && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {bundle.includedServices?.length || 0} Services Included
                  </Badge>
                )}
                {isCartMode && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {services.length} Services Selected
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{formatPrice(price)}</p>
              </div>
            </div>

            {bundle && bundle.includedServices && bundle.includedServices.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm font-medium mb-2">Included Services:</p>
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {bundle.includedServices.slice(0, 5).map((s) => (
                    <li key={s.id} className="flex items-start gap-2 text-xs">
                      <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{s.name}</span>
                    </li>
                  ))}
                  {bundle.includedServices.length > 5 && (
                    <li className="text-xs text-muted-foreground">
                      +{bundle.includedServices.length - 5} more services
                    </li>
                  )}
                </ul>
              </div>
            )}

            {isCartMode && services && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm font-medium mb-2">Selected Services:</p>
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {services.map((s) => (
                    <li key={s.id} className="flex items-start gap-2 text-xs">
                      <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">Campaign Name (Optional)</Label>
              <Input
                id="name"
                placeholder={`${name} Campaign`}
                value={formData.campaignName}
                onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="release" className="text-card-foreground">Select Release *</Label>
              <Select value={formData.releaseId} onValueChange={(value) => setFormData(prev => ({ ...prev, releaseId: value }))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Choose a release to promote" />
                </SelectTrigger>
                <SelectContent>
                  {releases.length === 0 ? (
                    <SelectItem value="none" disabled>No releases available</SelectItem>
                  ) : (
                    releases.map(release => (
                      <SelectItem key={release.id} value={release.id}>
                        {release.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={loading || releases.length === 0}>
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
