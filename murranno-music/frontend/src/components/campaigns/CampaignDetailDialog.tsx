import { Campaign } from "@/types/campaign";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  DollarSign,
  Package,
  Target,
  FileText,
  ExternalLink,
  Image as ImageIcon,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { CampaignMetricsDisplay } from "./CampaignMetricsDisplay";
import { ServiceDeliveryStatus } from "./ServiceDeliveryStatus";

interface CampaignDetailDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignDetailDialog({
  campaign,
  open,
  onOpenChange,
}: CampaignDetailDialogProps) {
  const assets = campaign.campaignAssets || [];
  const targetAudience = campaign.targetAudience || {};
  const socialLinks = campaign.socialLinks || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl">{campaign.name}</DialogTitle>
            <Badge
              className={
                campaign.status === 'Active'
                  ? 'bg-green-600/10 text-green-600'
                  : campaign.status === 'Rejected'
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {campaign.status}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Campaign Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Type</p>
                  <p className="font-medium">{campaign.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Platform</p>
                  <p className="font-medium">{campaign.platform}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Budget</p>
                  <p className="font-medium">₦{Number(campaign.budget).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Spent</p>
                  <p className="font-medium">₦{Number(campaign.spent).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Campaign Period
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Start Date</p>
                  <p className="font-medium">
                    {format(new Date(campaign.startDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                {campaign.endDate && (
                  <div>
                    <p className="text-muted-foreground mb-1">End Date</p>
                    <p className="font-medium">
                      {format(new Date(campaign.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Campaign Brief */}
            {campaign.campaignBrief && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Campaign Brief
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {campaign.campaignBrief}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Target Audience */}
            {Object.keys(targetAudience).length > 0 && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Target Audience
                  </h3>
                  <div className="grid gap-3 text-sm">
                    {targetAudience.ageRange && (
                      <div>
                        <p className="text-muted-foreground mb-1">Age Range</p>
                        <p className="font-medium">{targetAudience.ageRange}</p>
                      </div>
                    )}
                    {targetAudience.locations && targetAudience.locations.length > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1">Locations</p>
                        <p className="font-medium">{targetAudience.locations.join(', ')}</p>
                      </div>
                    )}
                    {targetAudience.genres && targetAudience.genres.length > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1">Genres</p>
                        <p className="font-medium">{targetAudience.genres.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Social & Streaming Links
                  </h3>
                  <div className="grid gap-2 text-sm">
                    {Object.entries(socialLinks).map(([platform, url]) => (
                      url && (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      )
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Campaign Assets */}
            {assets.length > 0 && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Campaign Assets ({assets.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {assets.map((asset: any, index: number) => (
                      <a
                        key={index}
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                      >
                        <img
                          src={asset.url}
                          alt={asset.name || `Asset ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="h-6 w-6 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Campaign Performance Metrics - Only show for active/completed campaigns */}
            {['Active', 'Completed', 'Paused'].includes(campaign.status) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance Metrics
                  </h3>
                  <CampaignMetricsDisplay campaignId={campaign.id} />
                </div>
              </>
            )}

            {/* Service Delivery Status */}
            {['Paid', 'In Review', 'Active', 'Completed', 'Paused'].includes(campaign.status) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Service Delivery
                  </h3>
                  <ServiceDeliveryStatus campaignId={campaign.id} />
                </div>
              </>
            )}

            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Payment Status</p>
                  <Badge
                    variant={campaign.paymentStatus === 'paid' ? 'default' : 'secondary'}
                  >
                    {campaign.paymentStatus || 'pending'}
                  </Badge>
                </div>
                {campaign.paymentAmount && (
                  <div>
                    <p className="text-muted-foreground mb-1">Payment Amount</p>
                    <p className="font-medium">
                      ₦{Number(campaign.paymentAmount).toLocaleString()}
                    </p>
                  </div>
                )}
                {campaign.paymentReference && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground mb-1">Reference</p>
                    <p className="font-mono text-xs">{campaign.paymentReference}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            {campaign.adminNotes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Admin Notes</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {campaign.adminNotes}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Rejection Reason */}
            {campaign.rejectionReason && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-destructive">Rejection Reason</h3>
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-destructive whitespace-pre-wrap">
                      {campaign.rejectionReason}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
