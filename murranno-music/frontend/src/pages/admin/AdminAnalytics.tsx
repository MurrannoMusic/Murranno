import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Music, 
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))'];

export default function AdminAnalytics() {
  const [timePeriod, setTimePeriod] = useState('30d');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-analytics-stats', timePeriod],
    queryFn: async () => {
      const daysAgo = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo);

      // Get user growth
      const { data: profiles, count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .gte('created_at', startDate.toISOString());

      // Get releases
      const { data: releases, count: totalReleases } = await supabase
        .from('releases')
        .select('*', { count: 'exact' })
        .gte('created_at', startDate.toISOString());

      // Get campaigns
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Get earnings
      const { data: earnings } = await supabase
        .from('earnings')
        .select('*')
        .gte('created_at', startDate.toISOString());

      const totalRevenue = earnings?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === 'Active').length || 0;

      return {
        totalUsers: totalUsers || 0,
        newUsers: profiles?.length || 0,
        totalReleases: totalReleases || 0,
        totalRevenue,
        activeCampaigns,
        profiles,
        releases,
        earnings,
        campaigns,
      };
    },
  });

  const { data: userGrowthData } = useQuery({
    queryKey: ['admin-user-growth', timePeriod],
    queryFn: async () => {
      const daysAgo = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Group by date
      const grouped: Record<string, number> = {};
      profiles?.forEach(p => {
        const date = format(new Date(p.created_at), 'MMM dd');
        grouped[date] = (grouped[date] || 0) + 1;
      });

      return Object.entries(grouped).map(([date, count]) => ({
        date,
        users: count,
      }));
    },
  });

  const { data: releasesByGenre } = useQuery({
    queryKey: ['admin-releases-by-genre'],
    queryFn: async () => {
      const { data: releases } = await supabase
        .from('releases')
        .select('genre');

      const grouped: Record<string, number> = {};
      releases?.forEach(r => {
        const genre = r.genre || 'Unknown';
        grouped[genre] = (grouped[genre] || 0) + 1;
      });

      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    },
  });

  const { data: revenueOverTime } = useQuery({
    queryKey: ['admin-revenue-over-time', timePeriod],
    queryFn: async () => {
      const daysAgo = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90;
      const startDate = subDays(new Date(), daysAgo);

      const { data: earnings } = await supabase
        .from('earnings')
        .select('created_at, amount')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Group by date
      const grouped: Record<string, number> = {};
      earnings?.forEach(e => {
        const date = format(new Date(e.created_at), 'MMM dd');
        grouped[date] = (grouped[date] || 0) + Number(e.amount);
      });

      return Object.entries(grouped).map(([date, amount]) => ({
        date,
        revenue: amount,
      }));
    },
  });

  const { data: userTierDistribution } = useQuery({
    queryKey: ['admin-user-tier-distribution'],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('tier');

      const grouped: Record<string, number> = {};
      roles?.forEach(r => {
        grouped[r.tier] = (grouped[r.tier] || 0) + 1;
      });

      return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    },
  });

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Platform Analytics</h2>
            <p className="text-muted-foreground">Monitor platform performance and user engagement</p>
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stats?.totalUsers || 0}</p>
                  <p className="text-xs text-success">+{stats?.newUsers || 0} new</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Music className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Releases</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stats?.totalReleases || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Activity className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stats?.activeCampaigns || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Growth</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
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
                      dataKey="users" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userTierDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userTierDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueOverTime || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Releases by Genre</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={releasesByGenre || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
