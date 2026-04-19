import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignDetailDialog } from "@/components/campaigns/CampaignDetailDialog";
import { Calendar, DollarSign, Eye, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { format } from "date-fns";

export default function CampaignTracking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchCampaigns();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          releases(title, cover_art_url),
          artists(stage_name),
          promotion_bundles(name, price),
          campaign_services(
            promotion_services(name, price)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database format to Campaign type
      const transformedCampaigns = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        artist: c.artists?.stage_name || '',
        platform: c.platform,
        status: c.status,
        budget: c.budget,
        spent: c.spent,
        reach: '0',
        engagement: '0',
        startDate: c.start_date,
        endDate: c.end_date,
        type: c.type,
        paymentStatus: c.payment_status,
        paymentReference: c.payment_reference,
        paymentAmount: c.payment_amount,
        campaignAssets: c.campaign_assets,
        campaignBrief: c.campaign_brief,
        targetAudience: c.target_audience,
        socialLinks: c.social_links,
        adminNotes: c.admin_notes,
        rejectionReason: c.rejection_reason,
        releases: c.releases,
      }));

      setCampaigns(transformedCampaigns);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('campaign-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('Campaign update:', payload);

          if (payload.eventType === 'INSERT') {
            fetchCampaigns();
          } else if (payload.eventType === 'UPDATE') {
            setCampaigns((prev) =>
              prev.map((campaign) =>
                campaign.id === payload.new.id ? { ...campaign, ...payload.new } : campaign
              )
            );
            toast.success('Campaign status updated');
          } else if (payload.eventType === 'DELETE') {
            setCampaigns((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusColor = (status: CampaignStatus) => {
    const colors: Record<CampaignStatus, string> = {
      'Draft': 'bg-muted text-muted-foreground',
      'Pending Payment': 'bg-yellow-500/10 text-yellow-500',
      'Paid': 'bg-green-500/10 text-green-500',
      'In Review': 'bg-blue-500/10 text-blue-500',
      'Active': 'bg-green-600/10 text-green-600',
      'Paused': 'bg-orange-500/10 text-orange-500',
      'Completed': 'bg-purple-500/10 text-purple-500',
      'Rejected': 'bg-red-500/10 text-red-500',
      'Cancelled': 'bg-gray-500/10 text-gray-500',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const filterCampaignsByTab = (tab: string) => {
    switch (tab) {
      case 'all':
        return campaigns;
      case 'active':
        return campaigns.filter((c) => ['Active', 'In Review', 'Paid'].includes(c.status));
      case 'pending':
        return campaigns.filter((c) => ['Draft', 'Pending Payment'].includes(c.status));
      case 'completed':
        return campaigns.filter((c) => ['Completed', 'Rejected', 'Cancelled'].includes(c.status));
      default:
        return campaigns;
    }
  };

  const filteredCampaigns = filterCampaignsByTab(activeTab);

  return (
    <div className="smooth-scroll">
      {/* PageHeader removed - using UnifiedTopBar */}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Track and manage your promotional campaigns
          </p>
          <Button onClick={() => navigate('/app/promotions')}>
            Create New Campaign
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({campaigns.filter((c) => ['Active', 'In Review', 'Paid'].includes(c.status)).length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({campaigns.filter((c) => ['Draft', 'Pending Payment'].includes(c.status)).length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({campaigns.filter((c) => ['Completed', 'Rejected', 'Cancelled'].includes(c.status)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </Card>
                ))}
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all'
                    ? "You haven't created any campaigns yet"
                    : `No ${activeTab} campaigns`}
                </p>
                <Button onClick={() => navigate('/app/promotions')}>
                  Create Your First Campaign
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredCampaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {(campaign as any).releases?.title || 'No release'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(campaign.status as CampaignStatus)}>
                          {campaign.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Budget</p>
                            <p className="font-semibold">₦{Number(campaign.budget).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Spent</p>
                            <p className="font-semibold">₦{Number(campaign.spent).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(campaign.startDate), 'MMM dd, yyyy')}
                          {campaign.endDate && ` - ${format(new Date(campaign.endDate), 'MMM dd, yyyy')}`}
                        </span>
                      </div>

                      {campaign.rejectionReason && (
                        <div className="p-3 bg-destructive/10 rounded-lg text-sm">
                          <p className="font-semibold text-destructive mb-1">Rejection Reason:</p>
                          <p className="text-destructive/80">{campaign.rejectionReason}</p>
                        </div>
                      )}

                      {campaign.adminNotes && campaign.status !== 'Rejected' && (
                        <div className="p-3 bg-muted rounded-lg text-sm">
                          <p className="font-semibold mb-1">Admin Notes:</p>
                          <p className="text-muted-foreground">{campaign.adminNotes}</p>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCampaign(campaign);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedCampaign && (
        <CampaignDetailDialog
          campaign={selectedCampaign}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}
    </div>
  );
}
