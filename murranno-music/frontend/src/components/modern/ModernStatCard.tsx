import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModernStatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon?: React.ReactNode;
}

export const ModernStatCard = ({ title, value, change, changeType, icon }: ModernStatCardProps) => {
  return (
    <Card className="stat-card interactive-element">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="body-sm text-muted-foreground">{title}</span>
          {icon && (
            <div className="p-2 bg-primary/10 rounded-xl">
              {icon}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="heading-md">{value}</div>
          {change && (
            <div className={cn(
              "body-sm font-semibold",
              changeType === 'positive' ? 'text-success' : 'text-destructive'
            )}>
              {change}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};