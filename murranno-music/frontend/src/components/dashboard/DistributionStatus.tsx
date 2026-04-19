import { Circle, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useReleases } from '@/hooks/useReleases';

export const DistributionStatus = () => {
    const { releases, loading } = useReleases();

    if (loading || releases.length === 0) return null;

    // Take recent 5 releases
    const recentReleases = releases.slice(0, 5);

    const getStatusConfig = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'published' || normalizedStatus === 'live') {
            return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Live' };
        } else if (normalizedStatus === 'pending' || normalizedStatus === 'processing' || normalizedStatus === 'in review') {
            return { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'In Review' };
        } else if (normalizedStatus === 'rejected' || normalizedStatus === 'takedown') {
            return { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle, label: 'Action Required' };
        } else {
            return { color: 'text-gray-500', bg: 'bg-gray-500/10', icon: Circle, label: status || 'Draft' };
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground px-1">Distribution Status</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {recentReleases.map((item, index) => {
                    const config = getStatusConfig(item.status);
                    const Icon = config.icon;

                    return (
                        <div key={item.id} className={`min-w-[160px] p-3 rounded-xl border border-white/5 bg-card/50 backdrop-blur-sm flex flex-col gap-2`}>
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-full ${config.bg}`}>
                                    <Icon className={`h-3 w-3 ${config.color}`} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>{config.label}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold truncate" title={item.title}>{item.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{item.artist || 'Unknown Artist'}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
