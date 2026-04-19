import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: any;
  onSuccess: () => void;
}

export function SubscriptionActionDialog({ open, onOpenChange, subscription, onSuccess }: Props) {
  const [action, setAction] = useState<string>(subscription ? "extend" : "grant");
  const [userId, setUserId] = useState("");
  const [tier, setTier] = useState<string>("label");
  const [durationMonths, setDurationMonths] = useState("1");
  const [trialDays, setTrialDays] = useState("0");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-subscription', {
        body: {
          action,
          subscription_id: subscription?.id,
          user_id: subscription ? subscription.user_id : userId,
          tier,
          duration_months: parseInt(durationMonths),
          trial_days: action === 'grant' ? parseInt(trialDays) : undefined,
          admin_notes: adminNotes,
        },
      });

      if (error) throw error;

      toast.success(`Subscription ${action}ed successfully`);
      onSuccess();
    } catch (error: any) {
      console.error('Error managing subscription:', error);
      toast.error(error.message || 'Failed to manage subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {subscription ? 'Manage Subscription' : 'Grant New Subscription'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {subscription ? (
            <>
              <div>
                <Label>Action</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extend">Extend Period</SelectItem>
                    <SelectItem value="cancel">Cancel</SelectItem>
                    <SelectItem value="refund">Refund & Cancel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {action === 'extend' && (
                <div>
                  <Label>Extend By (Months)</Label>
                  <Input
                    type="number"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    min="1"
                    max="12"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <Label>User ID</Label>
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user UUID"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Find user ID in Admin Users page
                </p>
              </div>

              <div>
                <Label>Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="label">Label</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Duration (Months)</Label>
                <Input
                  type="number"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  min="1"
                  max="12"
                />
              </div>

              <div>
                <Label>Trial Period (Days)</Label>
                <Input
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  min="0"
                  max="30"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set to 0 for no trial period
                </p>
              </div>
            </>
          )}

          <div>
            <Label>Admin Notes</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this action..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm {action === 'grant' ? 'Grant' : action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}