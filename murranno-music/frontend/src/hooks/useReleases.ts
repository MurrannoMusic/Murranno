import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Release, ReleaseStatus } from '@/types/release';

export const useReleases = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReleaseStatus | 'All'>('All');

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      setError(null);
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-user-releases');

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch releases');
      }

      setReleases(data.releases || []);
    } catch (error: any) {
      setError(error);
      console.error('Error fetching releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReleases = useMemo(() => {
    return releases.filter((release) => {
      const matchesSearch = release.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || release.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [releases, searchQuery, statusFilter]);

  const getReleaseById = (id: string): Release | undefined => {
    return releases.find(release => release.id === id);
  };

  const getStatusCount = (status: ReleaseStatus): number => {
    return releases.filter(release => release.status === status).length;
  };

  return {
    error,
    releases: filteredReleases,
    allReleases: releases,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    getReleaseById,
    getStatusCount,
    loading,
    refetch: fetchReleases,
  };
};
