import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUser {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    tier: string;
}

export function AdminTeamSettings() {
    const [inviteEmail, setInviteEmail] = useState('');
    const queryClient = useQueryClient();

    const { data: admins, isLoading } = useQuery({
        queryKey: ['admin-team'],
        queryFn: async () => {
            // Fetch users with 'admin' tier from user_roles joined with profiles
            const { data, error } = await supabase
                .from('user_roles')
                .select(`
          user_id,
          tier,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
                .eq('tier', 'admin');

            if (error) throw error;

            return data.map((item: any) => ({
                id: item.profiles.id,
                email: item.profiles.email,
                full_name: item.profiles.full_name,
                avatar_url: item.profiles.avatar_url,
                tier: item.tier
            })) as AdminUser[];
        }
    });

    const addAdmin = useMutation({
        mutationFn: async (email: string) => {
            // 1. Get user ID by email (requires admin privileges or RPC)
            // Since we don't have a direct "get user by email" RPC exposed yet, 
            // we'll try to find them in profiles if email is public, or assume the RPC exists/will exist.
            // For now, let's use a hypothetical generic function or just the existing make-admin pattern if available.
            // Actually, we can use the `get_user_id_by_email` if we created it, but likely we need to call an Edge Function for this security.

            const { data, error } = await supabase.functions.invoke('admin-manage-team', {
                body: { action: 'add', email }
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success('Admin added successfully');
            setInviteEmail('');
            queryClient.invalidateQueries({ queryKey: ['admin-team'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add admin');
        }
    });

    const removeAdmin = useMutation({
        mutationFn: async (userId: string) => {
            const { data, error } = await supabase.functions.invoke('admin-manage-team', {
                body: { action: 'remove', userId }
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success('Admin removed successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-team'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to remove admin');
        }
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        addAdmin.mutate(inviteEmail);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Admin Team
                </CardTitle>
                <CardDescription>
                    Manage users who have administrative access to the platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleInvite} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Input
                            placeholder="Enter user email address"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={addAdmin.isPending}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Admin
                    </Button>
                </form>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-4">Loading team...</TableCell>
                                </TableRow>
                            ) : admins?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-4">No admins found (this should not happen)</TableCell>
                                </TableRow>
                            ) : (
                                admins?.map((admin) => (
                                    <TableRow key={admin.id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={admin.avatar_url || ''} />
                                                <AvatarFallback>{admin.full_name?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{admin.full_name || 'Unknown User'}</span>
                                                <span className="text-xs text-muted-foreground">{admin.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                {admin.tier}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to remove this admin?')) {
                                                        removeAdmin.mutate(admin.id);
                                                    }
                                                }}
                                                disabled={removeAdmin.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
