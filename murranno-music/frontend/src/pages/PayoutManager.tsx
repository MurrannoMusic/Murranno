import { useState } from 'react';
import { DollarSign, Download, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layout/PageContainer';
import { ArtistFilter } from '@/components/filters/ArtistFilter';
import { PayoutCard } from '@/components/cards/PayoutCard';
import { useUserType } from '@/hooks/useUserType';
import { usePayouts } from '@/hooks/usePayouts';

export const PayoutManager = () => {
  const { currentUser, isLabel } = useUserType();
  const { payouts, getFilteredPayouts, getTotalPending, getStatusBadgeVariant } = usePayouts();

  const [selectedArtist, setSelectedArtist] = useState('all');

  const filteredPayouts = getFilteredPayouts(selectedArtist);
  const totalPending = getTotalPending();

  const artists = [
    { id: 'a1', name: 'Luna Sol', stageName: 'Luna Sol' },
    { id: 'a2', name: 'The Echoes', stageName: 'The Echoes' },
    { id: 'a3', name: 'Midnight Drive', stageName: 'Midnight Drive' }
  ];

  const requestBulkPayout = () => {
    console.log('Requesting bulk payout for all pending amounts...');
  };

  const handleApprove = (id: string) => {
    console.log('Approving payout:', id);
  };

  const handleViewDetails = (id: string) => {
    console.log('Viewing details for payout:', id);
  };

  return (
    <PageContainer>
      {/* Top Bar removed - using UnifiedTopBar */}

      <div className="mobile-container space-y-4 -mt-2">
        {/* Payout Stats */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-base font-bold text-card-foreground truncate">₦{totalPending.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-base font-bold text-card-foreground">3</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
              <div>
                <p className="text-base font-bold text-card-foreground truncate">₦195.60</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Artist Filter (for labels) */}
        {isLabel && (
          <Card className="bg-card border border-border rounded-[20px] shadow-soft">
            <CardContent className="p-4">
              <ArtistFilter
                selectedArtist={selectedArtist}
                onArtistChange={setSelectedArtist}
                artists={artists}
              />
            </CardContent>
          </Card>
        )}

        {/* Payout Requests */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground">Payout Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-[16px] border border-border hover:bg-secondary/30 transition-all duration-200">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-card-foreground">{payout.artist_name}</h3>
                      <Badge
                        variant={
                          payout.status === 'pending' ? 'secondary' :
                            payout.status === 'paid' ? 'default' :
                              'destructive'
                        }
                        className="text-xs"
                      >
                        {payout.status}
                      </Badge>
                    </div>
                    <span className="text-sm font-bold text-card-foreground">
                      {payout.currency} {payout.amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{payout.streams} streams • {new Date(payout.requested_at).toLocaleDateString()}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/10">
                    <span className="text-xs text-muted-foreground">Period: {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}</span>
                    {payout.status === 'pending' && isLabel && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => handleApprove(payout.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => handleViewDetails(payout.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-card-foreground">Payout Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 px-4 rounded-[16px] transition-all duration-200 shadow-primary hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98] text-sm"
              onClick={requestBulkPayout}
            >
              <span className="flex flex-col items-center">
                Request Bulk Payout
                <span className="text-xs mt-1 opacity-90">(₦{totalPending.toFixed(2)})</span>
              </span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-6 px-3 rounded-[16px] transition-all duration-200 text-xs">
                Export Records
              </button>

              <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-6 px-3 rounded-[16px] transition-all duration-200 text-xs">
                Schedule Payouts
              </button>
            </div>

            <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-6 px-4 rounded-[16px] transition-all duration-200 text-xs">
              Payout Settings
            </button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};