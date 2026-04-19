import { useState } from 'react';
import { Plus, ArrowLeft, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { PageContainer } from '@/components/layout/PageContainer';
import { ArtistCard } from '@/components/cards/ArtistCard';
import { AddArtistForm } from '@/components/forms/AddArtistForm';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { useArtists } from '@/hooks/useArtists';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ArtistManagement = () => {
  const { artists, loading, refetch } = useArtists();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddArtist = async (artist: { name: string; stageName: string; email?: string; revenueShare?: number; contractStartDate?: Date; contractEndDate?: Date; notes?: string }) => {
    try {
      setAdding(true);

      // If email is provided, use invite function
      if (artist.email) {
        const { data, error } = await supabase.functions.invoke('invite-artist-to-label', {
          body: {
            artistEmail: artist.email,
            revenueSharePercentage: artist.revenueShare || 50,
            contractStartDate: artist.contractStartDate?.toISOString(),
            contractEndDate: artist.contractEndDate?.toISOString(),
          }
        });

        if (error) throw error;
        toast.success('Artist invitation sent');
      } else {
        // Create new artist profile
        const { data, error } = await supabase.functions.invoke('add-artist-to-label', {
          body: {
            stage_name: artist.stageName,
            revenue_share_percentage: artist.revenueShare || 50,
            contract_start_date: artist.contractStartDate?.toISOString(),
            contract_end_date: artist.contractEndDate?.toISOString(),
            notes: artist.notes,
          }
        });

        if (error) throw error;
        toast.success('Artist added successfully');
      }

      setShowAddDialog(false);
      refetch();
    } catch (error: any) {
      console.error('Error adding artist:', error);
      toast.error(error.message || 'Failed to add artist');
    } finally {
      setAdding(false);
    }
  };

  const headerActions = (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="bg-secondary/30 hover:bg-secondary/40 border-0">
          <Plus className="h-4 w-4 mr-1" />
          Add Artist
        </Button>
      </DialogTrigger>
      <AddArtistForm
        onAdd={handleAddArtist}
        onCancel={() => setShowAddDialog(false)}
        isLabel={true}
      />
    </Dialog>
  );

  return (
    <PageContainer>
      {/* Top Bar removed - using UnifiedTopBar */}

      {/* Actions moved from header */}
      <div className="mobile-container pt-4 flex justify-end">
        {headerActions}
      </div>

      <div className="mobile-container space-y-4 -mt-2">
        {/* Artist Stats */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-card-foreground">{artists.length}</p>
                <p className="text-xs text-muted-foreground">Artists</p>
              </div>
              <div>
                <p className="text-xl font-bold text-card-foreground">
                  {artists.reduce((sum, a) => sum + (a.releases || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Releases</p>
              </div>
              <div>
                <p className="text-xl font-bold text-card-foreground">
                  ₦{artists.reduce((sum, a) => sum + parseFloat(a.revenue || '0'), 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Combined Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Artist List */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground">Your Artists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading artists...</div>
            ) : artists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No artists yet. Add your first artist to get started.
              </div>
            ) : (
              artists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={{
                    id: artist.id,
                    name: artist.stage_name,
                    stageName: artist.stage_name,
                    status: artist.status,
                    releases: artist.releases,
                    streams: artist.streams,
                    revenue: artist.revenue
                  }}
                  onViewDetails={(id) => window.location.href = `/app/artist-management/${id}`}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-3 rounded-[16px] transition-all duration-200 shadow-primary hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98] text-xs break-words">
                Bulk Payout
              </button>

              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-3 rounded-[16px] transition-all duration-200 border border-border text-xs break-words">
                Analytics
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-3 rounded-[16px] transition-all duration-200 border border-border text-xs break-words">
                Export Reports
              </button>

              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-4 px-3 rounded-[16px] transition-all duration-200 border border-border text-xs break-words">
                Upload Track
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};