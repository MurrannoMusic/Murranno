import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Clock, MapPin, Monitor, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface SecurityLog {
    id: string;
    event: string;
    details: any;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

export const SecurityActivityLog = () => {
    const [logs, setLogs] = useState<SecurityLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('security_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching security logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getEventIcon = (event: string) => {
        switch (event) {
            case 'withdrawal_requested':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'bank_account_added':
                return <CheckCircle2 className="h-4 w-4 text-success" />;
            case 'pin_changed':
                return <Shield className="h-4 w-4 text-primary" />;
            case 'login_anomalous':
                return <AlertTriangle className="h-4 w-4 text-destructive" />;
            default:
                return <Shield className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getEventTitle = (event: string) => {
        return event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="space-y-2 mt-2">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-6 bg-secondary/10 rounded-lg border border-dashed border-border mt-2">
                <p className="text-xs text-muted-foreground">No security activity recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 mt-2">
            {logs.map((log) => (
                <div key={log.id} className="p-3 bg-secondary/10 rounded-lg border border-border/50 flex gap-3 items-start">
                    <div className="mt-0.5">
                        {getEventIcon(log.event)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-card-foreground truncate">
                                {getEventTitle(log.event)}
                            </p>
                            <span className="text-[9px] text-muted-foreground shrink-0">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                            IP: {log.ip_address} • {log.user_agent.split(' ')[0]}
                        </p>
                        {log.details?.amount && (
                            <p className="text-[10px] font-medium text-primary mt-1">
                                Amount: ₦{log.details.amount.toLocaleString()} ({log.details.status})
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
