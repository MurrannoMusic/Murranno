import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubscriptionActionDialog } from "@/components/admin/SubscriptionActionDialog";
import { Calendar, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminSubscriptions() {
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  const { data: subscriptions, isLoading, refetch } = useQuery({
    queryKey: ['admin-subscriptions', tierFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          profiles!subscriptions_user_id_fkey (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (tierFilter !== 'all') {
        query = query.eq('tier', tierFilter as 'artist' | 'label' | 'agency' | 'admin');
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trial: "secondary",
      cancelled: "destructive",
      expired: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      artist: "bg-blue-500",
      label: "bg-purple-500",
      agency: "bg-green-500",
      admin: "bg-red-500",
    };
    return (
      <Badge className={colors[tier] || ""}>{tier}</Badge>
    );
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleManage = (subscription: any) => {
    setSelectedSubscription(subscription);
    setActionDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage user subscriptions and access tiers</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex gap-4 pt-6">
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="artist">Artist</SelectItem>
                <SelectItem value="label">Label</SelectItem>
                <SelectItem value="agency">Agency</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedSubscription(null);
                setActionDialogOpen(true);
              }}
            >
              Grant New Subscription
            </Button>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions ({subscriptions?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading subscriptions...</div>
            ) : subscriptions && subscriptions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Manual</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub: any) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{sub.profiles?.full_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{sub.profiles?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTierBadge(sub.tier)}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(sub.current_period_start).toLocaleDateString()} - {new Date(sub.current_period_end).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {getDaysRemaining(sub.current_period_end)} days
                        </div>
                      </TableCell>
                      <TableCell>
                        {sub.manually_managed && <Badge variant="outline">Manual</Badge>}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManage(sub)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No subscriptions found
              </div>
            )}
          </CardContent>
        </Card>

        <SubscriptionActionDialog
          open={actionDialogOpen}
          onOpenChange={setActionDialogOpen}
          subscription={selectedSubscription}
          onSuccess={() => {
            refetch();
            setActionDialogOpen(false);
          }}
        />
      </div>
    </AdminLayout>
  );
}