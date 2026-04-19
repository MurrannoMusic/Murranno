import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WithdrawalActionDialog } from '@/components/admin/WithdrawalActionDialog';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Download,
  Calendar,
  CreditCard,
  Users,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';

interface RevenueStats {
  totalRevenue: number;
  totalPayouts: number;
  pendingPayouts: number;
  activeUsers: number;
}

interface UserProfile {
  email: string;
  full_name: string | null;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  reference: string;
  user_email?: string;
  user_name?: string;
}

export default function AdminFinancials() {
  const [timePeriod, setTimePeriod] = useState('30d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['admin-financial-stats', timePeriod],
    queryFn: async () => {
      const daysAgo = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get total revenue from earnings
      const { data: earnings } = await supabase
        .from('earnings')
        .select('amount')
        .gte('created_at', startDate.toISOString());

      // Get withdrawal transactions
      const { data: withdrawals } = await supabase
        .from('withdrawal_transactions')
        .select('amount, status')
        .gte('created_at', startDate.toISOString());

      // Get active users with wallet balance
      const { data: activeWallets } = await supabase
        .from('wallet_balance')
        .select('user_id')
        .gt('total_earnings', 0);

      const totalRevenue = earnings?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const completedPayouts = withdrawals?.filter(w => w.status === 'completed') || [];
      const pendingPayouts = withdrawals?.filter(w => w.status === 'pending') || [];
      
      const totalPayouts = completedPayouts.reduce((sum, w) => sum + Number(w.amount), 0);
      const pendingAmount = pendingPayouts.reduce((sum, w) => sum + Number(w.amount), 0);

      return {
        totalRevenue,
        totalPayouts,
        pendingPayouts: pendingAmount,
        activeUsers: activeWallets?.length || 0,
      } as RevenueStats;
    },
  });

  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['admin-transactions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('withdrawal_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: withdrawals, error } = await query;
      if (error) throw error;

      // Fetch user profiles separately
      const userIds = withdrawals?.map(w => w.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Combine data
      const transactions = withdrawals?.map(w => {
        const profile = profiles?.find(p => p.id === w.user_id);
        return {
          ...w,
          user_email: profile?.email,
          user_name: profile?.full_name,
        };
      }) || [];

      return transactions as Transaction[];
    },
  });

  const { data: revenueBreakdown } = useQuery({
    queryKey: ['admin-revenue-breakdown', timePeriod],
    queryFn: async () => {
      const daysAgo = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: earnings } = await supabase
        .from('earnings')
        .select('source, amount')
        .gte('created_at', startDate.toISOString());

      const breakdown: Record<string, number> = {};
      earnings?.forEach(e => {
        breakdown[e.source] = (breakdown[e.source] || 0) + Number(e.amount);
      });

      return breakdown;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      processing: 'outline',
    };
    return variants[status] || 'secondary';
  };

  const exportTransactions = () => {
    if (!transactions) return;

    const csv = [
      ['Date', 'Reference', 'User', 'Email', 'Amount', 'Status'].join(','),
      ...transactions.map(t => [
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
        t.reference,
        t.user_name || 'N/A',
        t.user_email || 'N/A',
        t.amount,
        t.status,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>
            <p className="text-muted-foreground">Monitor revenue, payouts, and transactions</p>
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

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : formatCurrency(stats?.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Payouts</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : formatCurrency(stats?.totalPayouts || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <TrendingUp className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payouts</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : formatCurrency(stats?.pendingPayouts || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : stats?.activeUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueBreakdown && Object.entries(revenueBreakdown).map(([source, amount]) => (
                <div key={source} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{source}</p>
                      <p className="text-sm text-muted-foreground">Revenue stream</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(amount)}</p>
                </div>
              ))}
              {(!revenueBreakdown || Object.keys(revenueBreakdown).length === 0) && (
                <p className="text-center text-muted-foreground py-8">No revenue data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportTransactions} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.reference}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.user_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{transaction.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {['pending', 'flagged'].includes(transaction.status) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedWithdrawal(transaction);
                              setWithdrawalDialogOpen(true);
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <WithdrawalActionDialog
        open={withdrawalDialogOpen}
        onOpenChange={setWithdrawalDialogOpen}
        withdrawal={selectedWithdrawal}
        onSuccess={() => {
          refetchTransactions();
          setWithdrawalDialogOpen(false);
        }}
      />
    </AdminLayout>
  );
}
