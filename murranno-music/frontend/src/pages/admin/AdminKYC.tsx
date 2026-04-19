import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle, XCircle, FileText, Eye } from 'lucide-react';

export default function AdminKYC() {
    const queryClient = useQueryClient();
    const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

    const { data: profiles, isLoading } = useQuery({
        queryKey: ['admin-kyc-pending'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('kyc_status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const verifyMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: 'verified' | 'rejected' }) => {
            const { error } = await supabase
                .from('profiles')
                .update({
                    kyc_status: status,
                    kyc_tier: status === 'verified' ? 2 : 1
                })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('KYC Status updated');
            queryClient.invalidateQueries({ queryKey: ['admin-kyc-pending'] });
            setSelectedProfile(null);
        },
        onError: (err: any) => toast.error(err.message)
    });

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Identity Verification</h2>
                    <p className="text-muted-foreground">Review pending KYC submissions</p>
                </div>

                <Card>
                    <CardHeader><CardTitle>Pending Requests</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>NIN Number</TableHead>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
                                ) : profiles?.length === 0 ? (
                                    <TableRow><TableCell colSpan={4}>No pending requests</TableCell></TableRow>
                                ) : (
                                    profiles?.map((profile) => (
                                        <TableRow key={profile.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{profile.full_name || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">{profile.id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{profile.nin_number}</TableCell>
                                            <TableCell>
                                                {profile.id_document_url ? (
                                                    <Button variant="outline" size="sm" onClick={() => window.open(profile.id_document_url, '_blank')}>
                                                        <Eye className="h-4 w-4 mr-2" /> View Doc
                                                    </Button>
                                                ) : <span className="text-muted-foreground">No file</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => verifyMutation.mutate({ id: profile.id, status: 'verified' })}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => verifyMutation.mutate({ id: profile.id, status: 'rejected' })}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
