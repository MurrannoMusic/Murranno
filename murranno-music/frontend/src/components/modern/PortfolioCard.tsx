import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface PortfolioCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  subtitle?: string;
}

export const PortfolioCard = ({ title, value, change, changeType, subtitle }: PortfolioCardProps) => {
  return (
    <Card className="modern-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="body-md text-muted-foreground">{title}</span>
          <div className={`portfolio-change ${changeType === 'positive' ? 'positive' : 'negative'}`}>
            {change}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="portfolio-value">{value}</div>
        {subtitle && (
          <p className="body-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};