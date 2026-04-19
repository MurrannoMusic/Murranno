import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminRelease } from '@/types/admin';
import { toast } from 'sonner';

interface UseAdminReleasesParams {
    page: number;
    search: string;
    statusFilter: string;
    genreFilter: string;
    releaseTypeFilter: string;
}

export function useAdminReleases({
    page,
    search,
    statusFilter,
    genreFilter,
    releaseTypeFilter,
}: UseAdminReleasesParams) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-releases', page, search, statusFilter, genreFilter, releaseTypeFilter],
        queryFn: async () => {
            let query = supabase
                .from('releases')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * 20, page * 20 - 1);

            if (search) {
                query = query.ilike('title', `%${search}%`);
            }

            if (statusFilter && statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            if (genreFilter && genreFilter !== 'all') {
                query = query.eq('genre', genreFilter);
            }

            if (releaseTypeFilter && releaseTypeFilter !== 'all') {
                query = query.eq('release_type', releaseTypeFilter);
            }

            const { data, error, count } = await query;
            if (error) throw error;

            return {
                releases: (data as AdminRelease[]) || [],
                total: count || 0,
                totalPages: Math.ceil((count || 0) / 20),
                pending: data?.filter((r) => r.status === 'Pending').length || 0,
                published: data?.filter((r) => r.status === 'Published').length || 0,
                rejected: data?.filter((r) => r.status === 'Rejected').length || 0,
            };
        },
    });

    const moderateRelease = useMutation({
        mutationFn: async ({
            releaseId,
            status,
            reason,
        }: {
            releaseId: string;
            status: string;
            reason?: string;
        }) => {
            const { data, error } = await supabase.functions.invoke('admin-moderate-release', {
                body: { releaseId, status, reason },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success('Release status updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-releases'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update release status');
        },
    });

    return {
        releases: data?.releases || [],
        total: data?.total || 0,
        totalPages: data?.totalPages || 0,
        stats: {
            pending: data?.pending || 0,
            published: data?.published || 0,
            rejected: data?.rejected || 0,
        },
        isLoading,
        moderateRelease,
    };
}
