import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/utils/formatters';

interface ServiceDeliveryProps {
  campaignId: string;
}

export const ServiceDeliveryStatus = ({ campaignId }: ServiceDeliveryProps) => {
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchServices();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`campaign-services-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_services',
          filter: `campaign_id=eq.${campaignId}`
        },
        () => fetchServices()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_services')
        .select(`
          *,
          service:promotion_services (
            name,
            category
          )
        `)
        .eq('campaign_id', campaignId);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = services.filter(s => s.status === 'completed').length;
  const progress = services.length > 0 ? (completedCount / services.length) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Service Delivery</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {services.length} completed
          </span>
        </div>
        
        <Progress value={progress} className="h-2" />

        <div className="space-y-2">
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex-1">
                <p className="font-medium">{service.service?.name}</p>
                <p className="text-sm text-muted-foreground">{service.service?.category}</p>
                {service.notes && (
                  <p className="text-sm text-muted-foreground mt-1">{service.notes}</p>
                )}
              </div>
              <Badge variant={service.status === 'completed' ? 'default' : 'secondary'}>
                {service.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { supabase } from '@/integrations/supabase/client';
