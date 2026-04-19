import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminUser } from '@/types/admin';
import { toast } from 'sonner';

interface UseAdminUsersParams {
    page: number;
    search: string;
    tierFilter: string;
    statusFilter: string;
}

export function useAdminUsers({ page, search, tierFilter, statusFilter }: UseAdminUsersParams) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, search, tierFilter, statusFilter],
        queryFn: async () => {
            const payload: any = {
                page,
                limit: 20,
                ...(search && { search }),
            };
            if (tierFilter && tierFilter !== 'all') payload.tier = tierFilter;
            if (statusFilter && statusFilter !== 'all') payload.status = statusFilter;

            const { data, error } = await supabase.functions.invoke('admin-get-all-users', {
                body: payload,
            });
            if (error) throw error;

            // Ensure data matches AdminUser type structure if necessary, or cast
            return data as { users: AdminUser[]; total: number; totalPages: number };
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, newTier }: { userId: string; newTier: string }) => {
            const { data, error } = await supabase.functions.invoke('admin-update-user-role', {
                body: { userId, newTier },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success('User role updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update user role');
        },
    });

    return {
        users: data?.users || [],
        total: data?.total || 0,
        totalPages: data?.totalPages || 0,
        isLoading,
        updateRoleMutation,
    };
}
