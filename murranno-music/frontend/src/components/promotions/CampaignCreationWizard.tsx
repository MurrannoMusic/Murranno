import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReleases } from '@/hooks/useReleases';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PromotionService, PromotionBundle } from '@/types/promotion';
import { CampaignAsset, TargetAudience, SocialLinks } from '@/types/campaign';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  X, 
  CheckCircle2,
  FileImage,
  Video,
  Music,
  Package
} from 'lucide-react';

interface CampaignCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: PromotionService;
  bundle?: PromotionBundle;
  services?: PromotionService[];
  onSuccess?: () => void;
}

interface FormData {
  campaignName: string;
  releaseId: string;
  assets: CampaignAsset[];
  targetAudience: TargetAudience;
  campaignBrief: string;
  socialLinks: SocialLinks;
  budget?: number;
  duration?: number;
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Campaign name and release' },
  { id: 2, title: 'Assets', description: 'Upload promotional materials' },
  { id: 3, title: 'Target Audience', description: 'Define your audience' },
  { id: 4, title: 'Social Links', description: 'Connect your platforms' },
  { id: 5, title: 'Campaign Brief', description: 'Your goals and message' },
  { id: 6, title: 'Review', description: 'Confirm and submit' },
];

export const CampaignCreationWizard = ({
  open,
  onOpenChange,
  service,
  bundle,
  services = [],
  onSuccess,
}: CampaignCreationWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { releases, loading: releasesLoading } = useReleases();
  const { uploadImage, uploadAudio, uploading, progress } = useCloudinaryUpload();

  const [formData, setFormData] = useState<FormData>({
    campaignName: '',
    releaseId: '',
    assets: [],
    targetAudience: {},
    campaignBrief: '',
    socialLinks: {},
  });

  const campaignPrice = bundle?.price || service?.price || 0;
  const campaignName = bundle?.name || service?.name || '';
  const includedServices = bundle?.includedServices || (service ? [service] : services);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.campaignName.trim()) {
          toast.error('Please enter a campaign name');
          return false;
        }
        if (!formData.releaseId) {
          toast.error('Please select a release');
          return false;
        }
        return true;
      case 2:
        if (formData.assets.length === 0) {
          toast.error('Please upload at least one asset');
          return false;
        }
        return true;
      case 5:
        if (!formData.campaignBrief.trim()) {
          toast.error('Please provide a campaign brief');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleFileUpload = async (file: File, type: CampaignAsset['type']) => {
    try {
      let url, publicId;
      
      if (file.type.startsWith('image/')) {
        const result = await uploadImage(file, 'campaign-assets');
        url = result.url;
        publicId = result.publicId;
      } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        const result = await uploadAudio(file, 'campaign-assets');
        url = result.url;
        publicId = result.publicId;
      } else {
        throw new Error('Unsupported file type');
      }

      const newAsset: CampaignAsset = {
        type,
        url,
        publicId,
        name: file.name,
      };

      setFormData((prev) => ({
        ...prev,
        assets: [...prev.assets, newAsset],
      }));

      toast.success('Asset uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload asset');
    }
  };

  const removeAsset = (publicId: string) => {
    setFormData((prev) => ({
      ...prev,
      assets: prev.assets.filter((asset) => asset.publicId !== publicId),
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    try {
      setIsSubmitting(true);

      // Fetch release details to get artist_id
      const { data: releaseData } = await supabase
        .from('releases')
        .select('artist_id')
        .eq('id', formData.releaseId)
        .single();

      const campaignData = {
        name: formData.campaignName,
        type: bundle ? 'bundle' : 'service',
        platform: 'Multi-Platform',
        budget: campaignPrice,
        start_date: new Date().toISOString().split('T')[0],
        release_id: formData.releaseId,
        artist_id: releaseData?.artist_id,
        status: 'Draft',
        promotion_type: bundle ? 'bundle' : 'custom',
        bundle_id: bundle?.id,
        category: bundle?.slug || service?.category,
        service_ids: includedServices.map((s) => s.id),
        payment_amount: campaignPrice,
        campaign_assets: formData.assets,
        campaign_brief: formData.campaignBrief,
        target_audience: formData.targetAudience,
        social_links: formData.socialLinks,
      };

      const { data: campaignResponse, error: campaignError } = await supabase.functions.invoke(
        'create-campaign',
        { body: campaignData }
      );

      if (campaignError) throw campaignError;
      if (!campaignResponse?.success) {
        throw new Error(campaignResponse?.error || 'Failed to create campaign');
      }

      const campaignId = campaignResponse.campaign.id;

      // Link services to campaign
      if (includedServices.length > 0) {
        const serviceLinks = includedServices.map((svc) => ({
          campaign_id: campaignId,
          service_id: svc.id,
          status: 'pending',
        }));

        const { error: linkError } = await supabase
          .from('campaign_services')
          .insert(serviceLinks);

        if (linkError) throw linkError;
      }

      toast.success('Campaign created! Redirecting to payment...');

      // Initialize payment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'paystack-initialize-campaign-payment',
        {
          body: { campaign_id: campaignId },
        }
      );

      if (paymentError) throw paymentError;

      // Redirect to Paystack payment page
      window.location.href = paymentData.authorization_url;

    } catch (error: any) {
      console.error('Create campaign error:', error);
      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                id="campaignName"
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                placeholder="e.g., Summer Release Promo"
              />
            </div>
            <div>
              <Label htmlFor="release">Select Release *</Label>
              <Select
                value={formData.releaseId}
                onValueChange={(value) => setFormData({ ...formData, releaseId: value })}
                disabled={releasesLoading || releases.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={releasesLoading ? "Loading releases..." : releases.length === 0 ? "No releases available" : "Choose a release"} />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {releases.length === 0 && !releasesLoading ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No releases found. Please create a release first.
                    </div>
                  ) : (
                    releases.map((release) => (
                      <SelectItem key={release.id} value={release.id}>
                        {release.title} - {release.artist}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{campaignName}</span>
                <span className="font-bold">₦{campaignPrice.toLocaleString()}</span>
              </div>
              {includedServices.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Includes {includedServices.length} service{includedServices.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload promotional materials like logos, images, videos, or press kits
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                <FileImage className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'image');
                  }}
                  disabled={uploading}
                />
              </label>

              <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors">
                <Video className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Upload Video</span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'video');
                  }}
                  disabled={uploading}
                />
              </label>
            </div>

            {uploading && <Progress value={progress} className="w-full" />}

            {formData.assets.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Assets</Label>
                <div className="space-y-2">
                  {formData.assets.map((asset) => (
                    <div
                      key={asset.publicId}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {asset.type === 'image' && <FileImage className="h-4 w-4" />}
                        {asset.type === 'video' && <Video className="h-4 w-4" />}
                        <span className="text-sm">{asset.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAsset(asset.publicId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ageRange">Target Age Range</Label>
              <Input
                id="ageRange"
                value={formData.targetAudience.ageRange || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetAudience: { ...formData.targetAudience, ageRange: e.target.value },
                  })
                }
                placeholder="e.g., 18-35"
              />
            </div>
            <div>
              <Label htmlFor="locations">Target Locations (comma-separated)</Label>
              <Input
                id="locations"
                value={formData.targetAudience.locations?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetAudience: {
                      ...formData.targetAudience,
                      locations: e.target.value.split(',').map((s) => s.trim()),
                    },
                  })
                }
                placeholder="e.g., Nigeria, Ghana, Kenya"
              />
            </div>
            <div>
              <Label htmlFor="genres">Target Genres (comma-separated)</Label>
              <Input
                id="genres"
                value={formData.targetAudience.genres?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetAudience: {
                      ...formData.targetAudience,
                      genres: e.target.value.split(',').map((s) => s.trim()),
                    },
                  })
                }
                placeholder="e.g., Afrobeats, Hip Hop, R&B"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add your streaming and social media links
            </p>
            <div className="grid gap-3">
              {[
                { key: 'spotify', label: 'Spotify URL' },
                { key: 'appleMusic', label: 'Apple Music URL' },
                { key: 'youtube', label: 'YouTube URL' },
                { key: 'instagram', label: 'Instagram Handle' },
                { key: 'tiktok', label: 'TikTok Handle' },
                { key: 'twitter', label: 'Twitter/X Handle' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    value={(formData.socialLinks as any)[key] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, [key]: e.target.value },
                      })
                    }
                    placeholder={`Enter your ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="brief">Campaign Brief *</Label>
              <Textarea
                id="brief"
                value={formData.campaignBrief}
                onChange={(e) => setFormData({ ...formData, campaignBrief: e.target.value })}
                placeholder="Describe your campaign goals, key messages, target audience, and any special instructions..."
                rows={8}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be specific about what you want to achieve with this campaign
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campaign Name</p>
                <p className="font-medium">{formData.campaignName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Package</p>
                <p className="font-medium">{campaignName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">₦{campaignPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assets Uploaded</p>
                <p className="font-medium">{formData.assets.length} file(s)</p>
              </div>
              {Object.values(formData.targetAudience).some((v) => v) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Target Audience</p>
                  <p className="text-sm">
                    {formData.targetAudience.ageRange && `Age: ${formData.targetAudience.ageRange}`}
                    {formData.targetAudience.locations?.length && ` • Locations: ${formData.targetAudience.locations.join(', ')}`}
                  </p>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              By submitting, you agree to proceed to payment. Your campaign will be reviewed by our team after payment confirmation.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Campaign - Step {currentStep} of {STEPS.length}</DialogTitle>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id === currentStep ? 'text-primary font-medium' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      step.id < currentStep
                        ? 'bg-primary text-primary-foreground'
                        : step.id === currentStep
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">{renderStepContent()}</div>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Submit Campaign'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
