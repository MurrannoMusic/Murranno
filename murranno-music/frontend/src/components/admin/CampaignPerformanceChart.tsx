import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, MousePointer, Target } from 'lucide-react';

interface MetricData {
  date: string;
  reach: number;
  engagement: number;
  clicks: number;
  conversions: number;
}

interface CampaignPerformanceChartProps {
  data: MetricData[];
  campaignName: string;
}

export const CampaignPerformanceChart = ({ data, campaignName }: CampaignPerformanceChartProps) => {
  const totalReach = data.reduce((sum, d) => sum + d.reach, 0);
  const totalEngagement = data.reduce((sum, d) => sum + d.engagement, 0);
  const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
  const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0);

  const stats = [
    { label: 'Total Reach', value: totalReach.toLocaleString(), icon: Users, color: 'text-blue-500' },
    { label: 'Engagement', value: totalEngagement.toLocaleString(), icon: TrendingUp, color: 'text-green-500' },
    { label: 'Clicks', value: totalClicks.toLocaleString(), icon: MousePointer, color: 'text-purple-500' },
    { label: 'Conversions', value: totalConversions.toLocaleString(), icon: Target, color: 'text-orange-500' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="reach" 
                stroke="hsl(217, 91%, 60%)" 
                strokeWidth={2}
                name="Reach"
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="hsl(142, 76%, 36%)" 
                strokeWidth={2}
                name="Engagement"
              />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="hsl(262, 83%, 58%)" 
                strokeWidth={2}
                name="Clicks"
              />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="hsl(25, 95%, 53%)" 
                strokeWidth={2}
                name="Conversions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
