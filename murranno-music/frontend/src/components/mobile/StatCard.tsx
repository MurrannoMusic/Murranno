import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard = ({ icon: Icon, title, value, change, changeType = 'neutral' }: StatCardProps) => {
  return (
    <Card className="stat-card">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg sm:rounded-xl">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
              <p className="text-lg sm:text-xl font-semibold text-foreground">{value}</p>
            </div>
          </div>
          {change && (
            <div className={`text-xs sm:text-sm font-medium ${
              changeType === 'positive' ? 'text-success' :
              changeType === 'negative' ? 'text-destructive' :
              'text-muted-foreground'
            }`}>
              {change}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};