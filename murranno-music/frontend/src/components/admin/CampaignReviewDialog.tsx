import { useState } from 'react';
import { Campaign } from '@/types/campaign';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetadataWarnings } from './MetadataWarnings';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  DollarSign, 
  Target, 
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Music,
} from 'lucide-react';
import { format } from 'date-fns';
import { CampaignAsset } from '@/types/campaign';

interface CampaignReviewDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (adminNotes?: string) => void;
  onReject: (rejectionReason: string, adminNotes?: string) => void;
  onStatusChange: (status: string, adminNotes?: string) => void;
  isLoading?: boolean;
}

export function CampaignReviewDialog({
  campaign,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onStatusChange,
  isLoading,
}: CampaignReviewDialogProps) {
  const [adminNotes, setAdminNotes] = useState(campaign.adminNotes || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [newStatus, setNewStatus] = useState<string>(campaign.status);
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  const handleApprove = () => {
    onApprove(adminNotes);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return;
    }
    onReject(rejectionReason, adminNotes);
  };

  const handleStatusUpdate = () => {
    if (newStatus !== campaign.status) {
      onStatusChange(newStatus, adminNotes);
    }
  };

  const renderSocialLinks = () => {
    if (!campaign.socialLinks) return null;
    
    const links = Object.entries(campaign.socialLinks).filter(([_, url]) => url);
    if (links.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Music className="h-4 w-4" />
          Social & Streaming Links
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {links.map(([platform, url]) => (
            <a
              key={platform}
              href={url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {platform.replace(/([A-Z])/g, ' $1').trim()}
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderAssets = () => {
    if (!campaign.campaignAssets || campaign.campaignAssets.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Campaign Assets
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {(campaign.campaignAssets as CampaignAsset[]).map((asset, index) => (
            <div key={index} className="space-y-2">
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
              <div className="text-xs">
                <p className="font-medium truncate">{asset.name}</p>
                <p className="text-muted-foreground capitalize">{asset.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{campaign.name}</DialogTitle>
            <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'}>
              {campaign.status}
            </Badge>
          </div>
        </DialogHeader>

        <MetadataWarnings campaign={campaign} />

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Artist</p>
                <p className="font-medium">{campaign.artist}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Campaign Type</p>
                <Badge variant="outline">{campaign.type}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Platform</p>
                <p className="font-medium">{campaign.platform}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget
                </p>
                <p className="font-medium">₦{parseFloat(campaign.budget).toLocaleString()}</p>
              </div>
            </div>

            <Separator />

            {/* Campaign Period */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Campaign Period
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{format(new Date(campaign.startDate), 'MMM d, yyyy')}</p>
                </div>
                {campaign.endDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{format(new Date(campaign.endDate), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Campaign Brief */}
            {campaign.campaignBrief && (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Campaign Brief
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {campaign.campaignBrief}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Target Audience */}
            {campaign.targetAudience && (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Target Audience
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {campaign.targetAudience.ageRange && (
                      <div>
                        <p className="text-sm text-muted-foreground">Age Range</p>
                        <p className="text-sm">{campaign.targetAudience.ageRange}</p>
                      </div>
                    )}
                    {campaign.targetAudience.locations && campaign.targetAudience.locations.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Locations</p>
                        <p className="text-sm">{campaign.targetAudience.locations.join(', ')}</p>
                      </div>
                    )}
                    {campaign.targetAudience.genres && campaign.targetAudience.genres.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Genres</p>
                        <p className="text-sm">{campaign.targetAudience.genres.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Social Links */}
            {renderSocialLinks()}
            {campaign.socialLinks && <Separator />}

            {/* Assets */}
            {renderAssets()}
            {campaign.campaignAssets && campaign.campaignAssets.length > 0 && <Separator />}

            {/* Payment Info */}
            {campaign.paymentStatus && (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={campaign.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                        {campaign.paymentStatus}
                      </Badge>
                    </div>
                    {campaign.paymentAmount && (
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">₦{campaign.paymentAmount.toLocaleString()}</p>
                      </div>
                    )}
                    {campaign.paymentReference && (
                      <div>
                        <p className="text-sm text-muted-foreground">Reference</p>
                        <p className="text-sm font-mono">{campaign.paymentReference}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Admin Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add internal notes about this campaign..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {campaign.adminNotes && campaign.adminNotes !== adminNotes && (
                <p className="text-xs text-muted-foreground">
                  Previous notes: {campaign.adminNotes}
                </p>
              )}
            </div>

            {/* Status Update Section */}
            <div className="space-y-2">
              <Label htmlFor="status-select">Update Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rejection Reason */}
            {(showRejectionInput || campaign.rejectionReason) && (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Explain why this campaign is being rejected..."
                  value={rejectionReason || campaign.rejectionReason || ''}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            {campaign.status === 'In Review' || campaign.status === 'Paid' ? (
              <>
                <Button
                  variant="default"
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Campaign
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectionInput(true)}
                  disabled={isLoading || showRejectionInput}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Campaign
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                onClick={handleStatusUpdate}
                disabled={isLoading || newStatus === campaign.status}
                className="flex-1"
              >
                Update Status
              </Button>
            )}
          </div>
          
          {showRejectionInput && (
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
