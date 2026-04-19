import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Eye, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { CampaignReviewDialog } from '@/components/admin/CampaignReviewDialog';
import { BulkActionsBar } from '@/components/admin/BulkActionsBar';
import { CampaignPerformanceChart } from '@/components/admin/CampaignPerformanceChart';
import { Campaign } from '@/types/campaign';

export default function AdminCampaigns() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [performanceDialogOpen, setPerformanceDialogOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-campaigns', page, search, statusFilter],
    queryFn: async () => {
      const payload: any = {
        page,
        limit: 20,
        ...(search && { search }),
      };
      if (statusFilter && statusFilter !== 'all') payload.status = statusFilter;

      const { data, error } = await supabase.functions.invoke('admin-get-all-campaigns', {
        body: payload,
      });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      campaignId, 
      status, 
      adminNotes, 
      rejectionReason 
    }: { 
      campaignId: string; 
      status: string;
      adminNotes?: string;
      rejectionReason?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('admin-update-campaign-status', {
        body: { campaignId, status, adminNotes, rejectionReason },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Campaign status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      setReviewDialogOpen(false);
      setSelectedCampaign(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update campaign status');
    },
  });

  const handleReviewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setReviewDialogOpen(true);
  };

  const handleApprove = (adminNotes?: string) => {
    if (!selectedCampaign) return;
    updateStatusMutation.mutate({
      campaignId: selectedCampaign.id,
      status: 'Active',
      adminNotes,
    });
  };

  const handleReject = (rejectionReason: string, adminNotes?: string) => {
    if (!selectedCampaign) return;
    updateStatusMutation.mutate({
      campaignId: selectedCampaign.id,
      status: 'Rejected',
      rejectionReason,
      adminNotes,
    });
  };

  const handleStatusChange = (status: string, adminNotes?: string) => {
    if (!selectedCampaign) return;
    updateStatusMutation.mutate({
      campaignId: selectedCampaign.id,
      status,
      adminNotes,
    });
  };

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaignIds(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleBulkAction = async (action: string, rejectionReason?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-bulk-update-campaigns', {
        body: { campaignIds: selectedCampaignIds, action, rejectionReason }
      });

      if (error) throw error;

      toast.success(`Successfully ${action}ed ${data.updated || data.deleted} campaign(s)`);
      setSelectedCampaignIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    } catch (error: any) {
      console.error('Bulk action error:', error);
      toast.error(error.message || 'Failed to perform bulk action');
    }
  };

  const handleShowPerformance = async (campaign: Campaign) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-campaign-performance', {
        body: { campaignId: campaign.id }
      });

      if (error) throw error;

      setPerformanceData(data.data || []);
      setSelectedCampaign(campaign);
      setPerformanceDialogOpen(true);
    } catch (error: any) {
      console.error('Performance fetch error:', error);
      toast.error('Failed to load performance data');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'Draft': 'outline',
      'Pending Payment': 'secondary',
      'Paid': 'default',
      'In Review': 'secondary',
      'Active': 'default',
      'Paused': 'outline',
      'Completed': 'secondary',
      'Rejected': 'destructive',
      'Cancelled': 'destructive',
    };
    return variants[status] || 'outline';
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaign Management</h2>
          <p className="text-muted-foreground">Review and manage all campaign submissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns ({data?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedCampaignIds.length === data?.campaigns?.length && data?.campaigns?.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCampaignIds(data?.campaigns?.map((c: Campaign) => c.id) || []);
                        } else {
                          setSelectedCampaignIds([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data?.campaigns?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No campaigns found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.campaigns?.map((campaign: Campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCampaignIds.includes(campaign.id)}
                          onCheckedChange={() => toggleCampaignSelection(campaign.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.artist}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{campaign.type}</Badge>
                      </TableCell>
                      <TableCell>₦{parseFloat(campaign.budget).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(campaign.startDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReviewCampaign(campaign)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowPerformance(campaign)}
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Performance
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {data && data.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedCampaign && (
        <CampaignReviewDialog
          campaign={selectedCampaign}
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          onApprove={handleApprove}
          onReject={handleReject}
          onStatusChange={handleStatusChange}
          isLoading={updateStatusMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}
