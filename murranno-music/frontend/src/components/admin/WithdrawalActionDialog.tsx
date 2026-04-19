import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Flag, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawal: any;
  onSuccess: () => void;
}

export function WithdrawalActionDialog({ open, onOpenChange, withdrawal, onSuccess }: Props) {
  const [action, setAction] = useState<string>("approve");
  const [adminNotes, setAdminNotes] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!withdrawal) return null;

  const handleSubmit = async () => {
    if (action === 'reject' && !failureReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-review-withdrawal', {
        body: {
          action,
          withdrawal_id: withdrawal.id,
          admin_notes: adminNotes,
          failure_reason: action === 'reject' ? failureReason : undefined,
        },
      });

      if (error) throw error;

      toast.success(`Withdrawal ${action}ed successfully`);
      onSuccess();
    } catch (error: any) {
      console.error('Error reviewing withdrawal:', error);
      toast.error(error.message || 'Failed to review withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'approve':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'reject':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'flag':
        return <Flag className="h-5 w-5 text-yellow-500" />;
      case 'add_note':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getActionIcon()}
            Review Withdrawal Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Withdrawal Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="font-medium">{formatCurrency(withdrawal.net_amount, withdrawal.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fee:</span>
              <span>{formatCurrency(withdrawal.fee || 0, withdrawal.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className="capitalize">{withdrawal.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Reference:</span>
              <span className="text-xs font-mono">{withdrawal.reference}</span>
            </div>
          </div>

          {/* Action Selection */}
          <div>
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Approve & Process
                  </div>
                </SelectItem>
                <SelectItem value="reject">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Reject & Refund
                  </div>
                </SelectItem>
                <SelectItem value="flag">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-yellow-500" />
                    Flag for Review
                  </div>
                </SelectItem>
                <SelectItem value="add_note">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    Add Note Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Failure Reason (for reject) */}
          {action === 'reject' && (
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder="Explain why this withdrawal is being rejected..."
                rows={3}
                required
              />
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <Label>Admin Notes {action !== 'add_note' && '(Optional)'}</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this action..."
              rows={3}
            />
          </div>

          {/* Warning Messages */}
          {action === 'approve' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              This will initiate a Paystack transfer. Ensure the payout method is valid.
            </div>
          )}
          {action === 'reject' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              This will refund the amount to the user's wallet balance and notify them.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm {action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}