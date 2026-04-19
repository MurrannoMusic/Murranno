import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'critical';
    is_active: boolean;
}

export function GlobalAnnouncementBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [dismissedId, setDismissedId] = useState<string | null>(
        localStorage.getItem('dismissed_announcement_id')
    );

    const { data: announcement } = useQuery({
        queryKey: ['active-announcement'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data as Announcement | null;
        },
        // Refetch occasionally to catch new announcements
        refetchInterval: 60000,
    });

    useEffect(() => {
        if (announcement && announcement.id !== dismissedId) {
            setIsVisible(true);
        }
    }, [announcement, dismissedId]);

    if (!announcement || !isVisible || announcement.id === dismissedId) return null;

    const handleDismiss = () => {
        setIsVisible(false);
        setDismissedId(announcement.id);
        localStorage.setItem('dismissed_announcement_id', announcement.id);
    };

    const getStyles = (type: string) => {
        switch (type) {
            case 'critical':
                return 'bg-destructive text-destructive-foreground border-destructive/50';
            case 'warning':
                return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
            case 'info':
            default:
                return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <AlertCircle className="h-5 w-5" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            case 'info':
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    return (
        <div className={cn(
            "w-full px-4 py-3 border-b flex items-center justify-between gap-4 animate-in slide-in-from-top-2",
            getStyles(announcement.type)
        )}>
            <div className="flex items-center gap-3">
                {getIcon(announcement.type)}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="font-semibold">{announcement.title}:</span>
                    <span>{announcement.message}</span>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/10"
                onClick={handleDismiss}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
            </Button>
        </div>
    );
}
