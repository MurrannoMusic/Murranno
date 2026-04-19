import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AgencyClient {
  id: string;
  client_id: string;
  stage_name: string;
  profile_image: string | null;
  status: string;
  commission_percentage: number;
  contract_details: any;
  notes: string | null;
  created_at: string;
  releases: number;
  streams: string;
  campaigns: number;
  revenue: string;
}

export const useAgencyClients = () => {
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async (status?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-agency-clients', {
        body: { status }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch clients');
      }

      setClients(data.clients || []);
    } catch (error: any) {
      console.error('Error fetching agency clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientId: string, commissionPercentage?: number, contractDetails?: any, notes?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('add-client-to-agency', {
        body: { 
          clientId, 
          commissionPercentage,
          contractDetails,
          notes
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to add client');
      }

      toast.success('Client added successfully');
      await fetchClients();
      return data.agencyClient;
    } catch (error: any) {
      console.error('Error adding client:', error);
      toast.error(error.message || 'Failed to add client');
      throw error;
    }
  };

  return {
    clients,
    loading,
    fetchClients,
    addClient,
    refetch: fetchClients,
  };
};
