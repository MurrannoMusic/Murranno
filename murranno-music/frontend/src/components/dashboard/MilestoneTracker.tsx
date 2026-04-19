import { Trophy } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { useNavigate } from 'react-router-dom';

export const MilestoneTracker = () => {
    const { stats, loading } = useStats();
    const navigate = useNavigate();

    // Derive milestone from active releases
    // Levels: 1 (1 release), 5 (5 releases), 10 (10 releases), 25, 50, 100
    const milestones = [1, 5, 10, 25, 50, 100];
    const nextTarget = milestones.find(m => m > stats.activeReleases) || 100;
    const current = stats.activeReleases;

    // Calculate progress
    const progress = Math.min((current / nextTarget) * 100, 100);

    const remaining = nextTarget - current;
    const milestoneTitle = current < 5 ? "Rising Artist" : current < 25 ? "Established Artist" : "Star";

    if (loading) return null;

    return (
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-4 relative overflow-hidden" onClick={() => navigate('/app/upload')}>
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Trophy className="h-12 w-12 text-primary" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-primary">Next Milestone: {milestoneTitle}</h3>
                    <span className="text-xs font-medium text-muted-foreground">{current}/{nextTarget} releases</span>
                </div>

                <p className="text-xs text-foreground/80 mb-3">
                    {remaining > 0
                        ? `Upload ${remaining} more track${remaining === 1 ? '' : 's'} to reach your next milestone`
                        : "Level up! You're crushing it!"}
                </p>

                <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
