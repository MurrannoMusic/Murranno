import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  AlertCircle,
  Search,
  Download,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  totalFailed: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
}

interface CampaignPayment {
  id: string;
  name: string;
  user_id: string;
  payment_status: string;
  payment_amount: number;
  payment_reference: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

export default function AdminPayments() {
  const [search, setSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [timePeriod, setTimePeriod] = useState('30d');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-payment-stats', timePeriod],
    queryFn: async () => {
      const daysAgo = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('payment_status, payment_amount')
        .gte('created_at', startDate.toISOString())
        .not('payment_amount', 'is', null);

      if (error) throw error;

      const stats: PaymentStats = {
        totalPaid: 0,
        totalPending: 0,
        totalFailed: 0,
        paidCount: 0,
        pendingCount: 0,
        failedCount: 0,
      };

      campaigns?.forEach(campaign => {
        const amount = Number(campaign.payment_amount);
        switch (campaign.payment_status) {
          case 'paid':
            stats.totalPaid += amount;
            stats.paidCount++;
            break;
          case 'pending':
            stats.totalPending += amount;
            stats.pendingCount++;
            break;
          case 'failed':
            stats.totalFailed += amount;
            stats.failedCount++;
            break;
        }
      });

      return stats;
    },
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-campaign-payments', search, paymentStatusFilter],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select('*')
        .not('payment_amount', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (paymentStatusFilter !== 'all') {
        query = query.eq('payment_status', paymentStatusFilter as 'pending' | 'paid' | 'failed' | 'refunded');
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,payment_reference.ilike.%${search}%`);
      }

      const { data: campaigns, error } = await query;
      if (error) throw error;

      // Fetch user profiles separately
      const userIds = campaigns?.map(c => c.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Combine data
      const payments = campaigns?.map(campaign => {
        const profile = profiles?.find(p => p.id === campaign.user_id);
        return {
          ...campaign,
          user_email: profile?.email,
          user_name: profile?.full_name,
        };
      }) || [];

      return payments as CampaignPayment[];
    },
  });

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      paid: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline',
    };
    return variants[status] || 'secondary';
  };

  const exportPayments = () => {
    if (!payments) return;

    const csv = [
      ['Date', 'Campaign Name', 'User', 'Email', 'Amount', 'Payment Status', 'Reference', 'Campaign Status'].join(','),
      ...payments.map(p => [
        format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
        p.name,
        p.user_name || 'N/A',
        p.user_email || 'N/A',
        p.payment_amount,
        p.payment_status,
        p.payment_reference || 'N/A',
        p.status,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Payments exported successfully');
  };

  const copyReference = (reference: string) => {
    navigator.clipboard.writeText(reference);
    toast.success('Payment reference copied to clipboard');
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Campaign Payments</h2>
            <p className="text-muted-foreground">Monitor and manage all campaign payment transactions</p>
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

        {/* Payment Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : formatCurrency(stats?.totalPaid || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.paidCount || 0} campaigns
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
                  <p className="text-sm text-muted-foreground">Pending Payment</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : formatCurrency(stats?.totalPending || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.pendingCount || 0} campaigns
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed Payments</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : formatCurrency(stats?.totalFailed || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.failedCount || 0} campaigns
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by campaign name or reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payment Transactions ({payments?.length || 0})</CardTitle>
            <Button variant="outline" size="sm" onClick={exportPayments} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Campaign Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : payments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No payment transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {format(new Date(payment.created_at), 'MMM d, yyyy')}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.created_at), 'HH:mm')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {payment.id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.user_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{payment.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(payment.payment_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusBadge(payment.payment_status)}>
                          {payment.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.payment_reference ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyReference(payment.payment_reference)}
                            className="font-mono text-xs gap-2"
                          >
                            {payment.payment_reference.slice(0, 12)}...
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">No reference</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Testing Guide */}
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Testing Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">How to Test Payment Flow:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Go to <strong>Promotions</strong> page and select a promotion bundle or services</li>
                <li>Fill in campaign details (name, artist, dates, assets, target audience)</li>
                <li>Click "Create Campaign & Proceed to Payment"</li>
                <li>You'll be redirected to Paystack payment page (use test card: 4084 0840 8408 4081)</li>
                <li>Complete payment and you'll be redirected to success page</li>
                <li>The webhook will automatically update campaign status to "Paid"</li>
                <li>Payment will appear in this dashboard with all details</li>
              </ol>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">
                <strong>Note:</strong> Payments are processed via Paystack and verified through webhooks. 
                The status updates automatically when payment is confirmed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
