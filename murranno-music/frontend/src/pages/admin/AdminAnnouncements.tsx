import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Megaphone } from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'critical';
    is_active: boolean;
    created_at: string;
}

export default function AdminAnnouncements() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Announcement | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        is_active: true
    });

    const { data: announcements, isLoading } = useQuery({
        queryKey: ['admin-announcements'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_announcements')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Announcement[];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const { error } = await supabase.from('system_announcements').insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setDialogOpen(false);
            toast.success('Announcement created');
        },
        onError: (err: any) => toast.error(err.message)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const { error } = await supabase.from('system_announcements').update(data).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setDialogOpen(false);
            toast.success('Announcement updated');
        },
        onError: (err: any) => toast.error(err.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('system_announcements').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            toast.success('Announcement deleted');
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handleSubmit = () => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (item: Announcement) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            message: item.message,
            type: item.type as string,
            is_active: item.is_active
        });
        setDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            message: '',
            type: 'info',
            is_active: true
        });
        setDialogOpen(true);
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">System Announcements</h2>
                        <p className="text-muted-foreground">Manage global banners and alerts</p>
                    </div>
                    <Button onClick={handleAddNew}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Announcement
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                                ) : announcements?.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center">No announcements</TableCell></TableRow>
                                ) : (
                                    announcements?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Switch
                                                    checked={item.is_active}
                                                    onCheckedChange={(checked) => updateMutation.mutate({ id: item.id, data: { is_active: checked } })}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell className="max-w-md truncate">{item.message}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.type === 'critical' ? 'destructive' : item.type === 'warning' ? 'secondary' : 'default'}>
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{format(new Date(item.created_at), 'MMM d, yyyy')}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteMutation.mutate(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Maintenance Alert" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <Textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="System will be down for..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={formData.type} onValueChange={val => setFormData({ ...formData, type: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="info">Info (Blue)</SelectItem>
                                        <SelectItem value="warning">Warning (Yellow)</SelectItem>
                                        <SelectItem value="critical">Critical (Red)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="active" checked={formData.is_active} onCheckedChange={checked => setFormData({ ...formData, is_active: checked })} />
                                <label htmlFor="active" className="text-sm font-medium">Active immediately</label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit}>{editingItem ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
