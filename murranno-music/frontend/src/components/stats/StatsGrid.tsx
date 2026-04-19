import { Play, DollarSign, Users, Music } from 'lucide-react';
import { StatCard } from '@/components/mobile/StatCard';
import { StatItem } from '@/types/stats';

interface StatsGridProps {
  stats: StatItem[];
  className?: string;
}

const iconMap = {
  'Total Streams': Play,
  'Earnings': DollarSign,
  'Followers': Users,
  'Releases': Music
};

export const StatsGrid = ({ stats, className = "mobile-card-grid" }: StatsGridProps) => {
  return (
    <div className={className}>
      {stats.map((stat) => {
        const IconComponent = iconMap[stat.title as keyof typeof iconMap] || Play;
        return (
          <StatCard
            key={stat.title}
            icon={IconComponent}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
          />
        );
      })}
    </div>
  );
};