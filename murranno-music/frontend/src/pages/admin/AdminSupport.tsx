import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MessageSquare, CheckCircle, XCircle, Mail } from 'lucide-react';

interface Ticket {
    id: string;
    user_id: string;
    subject: string;
    message: string;
    category: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    user?: { email: string };
    admin_notes?: string;
}

export default function AdminSupport() {
    const queryClient = useQueryClient();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['admin-support-tickets', statusFilter],
        queryFn: async () => {
            let query = supabase
                .from('support_tickets')
                .select('*, user:user_email(email)') // Assuming a function or view, but for now we might need to join profiles if possible or just use raw user_id
                // Actually standard join: users is not exposed. We might need to fetch profiles. 
                // Let's try select *, profiles(email) if linked, but user_id is FK to auth.users.
                // auth.users is not joinable directly. We usually join profiles.
                // Let's fetch profiles(email) assuming profile exists.
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as any[];
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, notes }: { id: string, status: string, notes?: string }) => {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status, admin_notes: notes })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Ticket updated');
            queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
            setSelectedTicket(null);
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handleResolve = () => {
        if (!selectedTicket) return;
        updateStatusMutation.mutate({
            id: selectedTicket.id,
            status: 'resolved',
            notes: replyMessage ? `Admin Reply: ${replyMessage}` : undefined
        });
        // ideally send email here via Edge funtion
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'default'; // black/white
            case 'in_progress': return 'secondary'; // gray
            case 'resolved': return 'outline'; // green-ish usually but outline works
            case 'closed': return 'secondary';
            default: return 'secondary';
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
                    <p className="text-muted-foreground">Manage user support requests</p>
                </div>

                <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
                                ) : tickets?.length === 0 ? (
                                    <TableRow><TableCell colSpan={5}>No tickets found</TableCell></TableRow>
                                ) : (
                                    tickets?.map((ticket) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell>{format(new Date(ticket.created_at), 'MMM d, yyyy')}</TableCell>
                                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                                            <TableCell className="capitalize">{ticket.category}</TableCell>
                                            <TableCell><Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge></TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>
                                                            <MessageSquare className="h-4 w-4 mr-2" /> View
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>{ticket.subject}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="bg-muted p-3 rounded-md text-sm">
                                                                <p className="font-semibold mb-1">Message:</p>
                                                                {ticket.message}
                                                            </div>

                                                            {/* Admin Reply Area */}
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">Internal Notes / Resolution</label>
                                                                <Textarea
                                                                    placeholder="Add notes about resolution..."
                                                                    value={replyMessage}
                                                                    onChange={e => setReplyMessage(e.target.value)}
                                                                />
                                                            </div>

                                                            <div className="flex gap-2 justify-end">
                                                                <Button variant="outline" onClick={() => updateStatusMutation.mutate({ id: ticket.id, status: 'in_progress', notes: replyMessage })}>
                                                                    Mark In Progress
                                                                </Button>
                                                                <Button onClick={handleResolve}>
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Resolve & Close
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
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
