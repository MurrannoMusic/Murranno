import { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/layout/PageContainer';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { CampaignStats } from '@/components/campaigns/CampaignStats';
import { CampaignFilter } from '@/components/campaigns/CampaignFilter';
import { CampaignList } from '@/components/campaigns/CampaignList';
import { CampaignActions } from '@/components/campaigns/CampaignActions';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useCampaignActions } from '@/hooks/useCampaignActions';

export const CampaignManager = () => {
  const { campaigns, stats, getFilteredCampaigns, getStatusBadgeVariant, refetch } = useCampaigns();
  const { pauseCampaign, duplicateCampaign, viewAnalytics, editCampaign, loading } = useCampaignActions();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCampaigns = getFilteredCampaigns(statusFilter);

  const handleEdit = (id: string) => {
    editCampaign(id);
  };

  const handleViewAnalytics = (id: string) => {
    viewAnalytics(id);
  };

  const handlePause = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      const success = await pauseCampaign(id, campaign.status);
      if (success) refetch();
    }
  };

  const handleDuplicate = async (id: string) => {
    const success = await duplicateCampaign(id);
    if (success) refetch();
  };

  const exportToPDF = () => {
    console.log('Exporting campaigns to PDF...');
  };

  return (
    <PageContainer>
      {/* Top Bar removed - using UnifiedTopBar */}

      <div className="mobile-container space-y-4 -mt-2">
        <CampaignStats stats={stats} />

        <CampaignFilter
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />

        <CampaignList
          campaigns={filteredCampaigns}
          statusFilter={statusFilter}
          getStatusBadgeVariant={getStatusBadgeVariant}
          onEdit={handleEdit}
          onViewAnalytics={handleViewAnalytics}
          onPause={handlePause}
          onDuplicate={handleDuplicate}
        />

        <CampaignActions onExportToPDF={exportToPDF} />
      </div>
    </PageContainer>
  );
};