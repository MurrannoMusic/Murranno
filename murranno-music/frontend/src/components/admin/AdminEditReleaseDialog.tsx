import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminRelease } from '@/types/admin';

interface AdminEditReleaseDialogProps {
    release: AdminRelease | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AdminEditReleaseDialog({ release, open, onOpenChange }: AdminEditReleaseDialogProps) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        genre: '',
        release_type: '',
        status: '',
        release_date: '',
        label: '',
        upc_ean: '',
    });

    // Initialize form when release changes
    useState(() => {
        if (release) {
            setFormData({
                title: release.title || '',
                genre: release.genre || '',
                release_type: release.release_type || '',
                status: release.status || '',
                release_date: release.release_date ? release.release_date.split('T')[0] : '',
                label: release.label || '',
                upc_ean: release.upc_ean || '',
            });
        }
    });

    // Update form data when release prop changes (effect)
    // We use key on the dialog or similar to reset, but here manually:
    if (release && open && formData.title === '' && release.title !== '') {
        // This is a bit hacky, better to use useEffect.
        // Let's use useEffect in the component.
    }

    // Revised approach with Effect
    const [initializedId, setInitializedId] = useState<string | null>(null);
    if (release && release.id !== initializedId) {
        setFormData({
            title: release.title || '',
            genre: release.genre || '',
            release_type: release.release_type || '',
            status: release.status || '',
            release_date: release.release_date ? release.release_date.split('T')[0] : '',
            label: release.label || '',
            upc_ean: release.upc_ean || '',
        });
        setInitializedId(release.id);
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!release) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('releases')
                .update({
                    title: formData.title,
                    genre: formData.genre,
                    release_type: formData.release_type,
                    status: formData.status,
                    release_date: formData.release_date, // Ensure format YYYY-MM-DD matches validation if any
                    label: formData.label || null,
                    upc_ean: formData.upc_ean || null,
                })
                .eq('id', release.id);

            if (error) throw error;

            toast.success('Release updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-releases'] });
            onOpenChange(false);
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.message || 'Failed to update release');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!release) return;
        if (!confirm('Are you sure you want to DELETE this release? This cannot be undone.')) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('releases')
                .delete()
                .eq('id', release.id);

            if (error) throw error;

            toast.success('Release deleted completely');
            queryClient.invalidateQueries({ queryKey: ['admin-releases'] });
            onOpenChange(false);
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Failed to delete release');
        } finally {
            setLoading(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Release</DialogTitle>
                    <DialogDescription>
                        Modify details for {release?.title}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select
                            value={formData.release_type}
                            onValueChange={(val) => handleChange('release_type', val)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="EP">EP</SelectItem>
                                <SelectItem value="Album">Album</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="genre" className="text-right">Genre</Label>
                        <Input
                            id="genre"
                            value={formData.genre}
                            onChange={(e) => handleChange('genre', e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(val) => handleChange('status', val)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Published">Published</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Takedown">Takedown</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Release Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.release_date}
                            onChange={(e) => handleChange('release_date', e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="label" className="text-right">Label</Label>
                        <Input
                            id="label"
                            value={formData.label}
                            onChange={(e) => handleChange('label', e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="upc" className="text-right">UPC/EAN</Label>
                        <Input
                            id="upc"
                            value={formData.upc_ean}
                            onChange={(e) => handleChange('upc_ean', e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="destructive" onClick={handleDelete} disabled={loading} className="mr-auto">
                        Delete Release
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
