import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaignMetrics } from '@/hooks/useCampaignMetrics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface CampaignMetricsProps {
  campaignId: string;
}

export const CampaignMetricsDisplay = ({ campaignId }: CampaignMetricsProps) => {
  const { metrics, loading, getTotalMetrics } = useCampaignMetrics(campaignId);
  const totals = getTotalMetrics();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No performance data available yet. Metrics will appear once your campaign starts running.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Reach</p>
            <p className="text-2xl font-bold">{formatNumber(totals?.totalReach || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Impressions</p>
            <p className="text-2xl font-bold">{formatNumber(totals?.totalImpressions || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Engagement</p>
            <p className="text-2xl font-bold">{formatNumber(totals?.totalEngagement || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Clicks</p>
            <p className="text-2xl font-bold">{formatNumber(totals?.totalClicks || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Conversions</p>
            <p className="text-2xl font-bold">{formatNumber(totals?.totalConversions || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Spend</p>
            <p className="text-2xl font-bold">{formatCurrency(totals?.totalSpend || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: any) => formatNumber(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="reach" stroke="hsl(var(--primary))" name="Reach" />
              <Line type="monotone" dataKey="engagement" stroke="hsl(var(--accent))" name="Engagement" />
              <Line type="monotone" dataKey="clicks" stroke="hsl(var(--secondary))" name="Clicks" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
