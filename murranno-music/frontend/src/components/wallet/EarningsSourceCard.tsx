import { Music, Music2, Video, Music4, TrendingUp, TrendingDown } from 'lucide-react';
import { EarningsSource } from '@/types/wallet';
import { cn } from '@/lib/utils';

interface EarningsSourceCardProps {
  source: EarningsSource;
}

const iconMap = {
  Music,
  Music2,
  Video,
  Music4,
};

export const EarningsSourceCard = ({ source }: EarningsSourceCardProps) => {
  const Icon = iconMap[source.icon as keyof typeof iconMap] || Music;
  const isPositiveGrowth = source.growth >= 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-[16px] border border-border">
      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-card-foreground truncate">{source.platform}</p>
          <span className="text-sm font-bold text-card-foreground">₦{source.amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {source.streams ? `${source.streams.toLocaleString()} streams` : `${source.percentage}% of total`}
          </p>
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isPositiveGrowth ? "text-success" : "text-destructive"
          )}>
            {isPositiveGrowth ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(source.growth)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
