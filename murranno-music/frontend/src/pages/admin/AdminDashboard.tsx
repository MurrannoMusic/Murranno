import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStats } from '@/hooks/admin/useAdminStats';

export default function AdminDashboard() {
  const { analytics, isLoading } = useAdminStats();

  const stats = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Subscriptions',
      value: analytics?.activeSubscriptions || 0,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Total Releases',
      value: analytics?.totalReleases || 0,
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      title: 'Platform Revenue',
      value: `₦${(analytics?.platformRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your platform's performance
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution by Tier</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(analytics?.tierDistribution || {}).map(([tier, count]) => (
                    <div key={tier} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{tier}</span>
                      <span className="text-sm text-muted-foreground">{count as number}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Campaigns</span>
                    <span className="text-sm text-muted-foreground">
                      {analytics?.totalCampaigns || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Earnings</span>
                    <span className="text-sm text-muted-foreground">
                      ₦{(analytics?.totalEarnings || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Withdrawals</span>
                    <span className="text-sm text-muted-foreground">
                      ₦{(analytics?.totalWithdrawals || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}