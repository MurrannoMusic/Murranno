import { useState } from 'react';
import { X, DollarSign, Clock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePayoutMethods } from '@/hooks/usePayoutMethods';
import { TransactionPinDialog } from './TransactionPinDialog';
import { useWalletSecurity } from '@/hooks/useWalletSecurity';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { isNativeApp } from '@/utils/platformDetection';
import { Badge } from '@/components/ui/badge';

interface WithdrawSheetProps {
  open: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess?: () => void;
}

export const WithdrawSheet = ({ open, onClose, availableBalance, onSuccess }: WithdrawSheetProps) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { payoutMethods } = usePayoutMethods();

  const withdrawalAmount = parseFloat(amount) || 0;
  const fee = withdrawalAmount >= 5000 ? 50 : withdrawalAmount > 0 ? 25 : 0;
  const netAmount = withdrawalAmount - fee;

  const { hasPin, isLocked, lockExpiresAt, loading: securityLoading, verifyPin, refetch: refetchSecurity } = useWalletSecurity();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const { authenticate, checkAvailability } = useBiometricAuth();

  const handleWithdraw = async () => {
    if (!amount || withdrawalAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }
    if (withdrawalAmount > availableBalance) {
      toast({
        title: 'Error',
        description: 'Insufficient balance',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedMethod) {
      toast({
        title: 'Error',
        description: 'Please select a payout method',
        variant: 'destructive',
      });
      return;
    }

    if (isLocked) {
      toast({
        title: 'Security Lock Active',
        description: 'A 24-hour security lock is active after bank details change. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    if (!hasPin) {
      toast({
        title: 'PIN Setup Required',
        description: 'Please set up a transaction PIN in Settings before withdrawing.',
        variant: 'destructive',
      });
      return;
    }

    // Advanced Biometric Re-auth for Native App
    if (isNativeApp()) {
      const biometricEnabled = localStorage.getItem('biometric_enabled') === 'true';
      if (biometricEnabled) {
        const availability = await checkAvailability();
        if (availability.isAvailable) {
          const success = await authenticate({
            reason: 'Confirm withdrawal authorization',
            androidTitle: 'Confirm Withdrawal',
          });
          if (!success) return; // User cancelled or failed biometric
        }
      }
    }

    setShowPinDialog(true);
  };

  const processWithdrawal = async (pin: string) => {
    try {
      setPinLoading(true);

      const pinValid = await verifyPin(pin);
      if (!pinValid) {
        toast({
          title: 'Incorrect PIN',
          description: 'The PIN you entered is incorrect.',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      setShowPinDialog(false);

      const { data, error } = await supabase.functions.invoke('paystack-initiate-withdrawal', {
        body: {
          payout_method_id: selectedMethod,
          amount: withdrawalAmount,
          description: 'Withdrawal from wallet',
          pin: pin, // Pass PIN for server-side verification too
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Withdrawal request submitted successfully!',
        });
        setAmount('');
        setSelectedMethod('');
        onSuccess?.();
        onClose();
      } else {
        throw new Error(data.error || 'Failed to initiate withdrawal');
      }
    } catch (error: any) {
      console.error('Error initiating withdrawal:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process withdrawal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setPinLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-[24px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Withdraw Funds</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Available Balance */}
          <div className="bg-primary/10 rounded-[16px] p-4 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-card-foreground">₦{availableBalance.toFixed(2)}</p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-semibold text-card-foreground mb-2 block">
              Withdrawal Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg font-semibold"
              />
            </div>
            {withdrawalAmount > availableBalance && (
              <div className="flex items-center gap-2 mt-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">Amount exceeds available balance</span>
              </div>
            )}
          </div>

          {/* Payout Method Selection */}
          <div>
            <label className="text-sm font-semibold text-card-foreground mb-2 block">
              Payout Method
            </label>
            {payoutMethods.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 bg-secondary/20 rounded-lg">
                No payout methods available. Please add a bank account first.
              </div>
            ) : (
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] bg-secondary/30 border border-border text-foreground font-medium"
              >
                <option value="">Select a payout method</option>
                {payoutMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.bank_name} - {method.account_number}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Fee Breakdown */}
          {withdrawalAmount > 0 && (
            <div className="bg-secondary/20 rounded-[16px] p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-card-foreground">₦{withdrawalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-semibold text-destructive">-₦{fee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border my-2"></div>
              <div className="flex justify-between">
                <span className="font-semibold text-card-foreground">You'll Receive</span>
                <span className="font-bold text-success text-lg">₦{netAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Threshold Warnings */}
          {withdrawalAmount >= 50000 ? (
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-[16px]">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-500">Manual Review Required</p>
                <p className="text-[10px] text-muted-foreground">Withdrawals above ₦50,000 are subject to administrator approval.</p>
              </div>
            </div>
          ) : withdrawalAmount >= 5000 ? (
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-[16px]">
              <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-500">12-Hour Security Wait</p>
                <p className="text-[10px] text-muted-foreground">This amount will be processed after a 12-hour automated verification delay.</p>
              </div>
            </div>
          ) : withdrawalAmount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-[16px] text-success text-[10px] font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>Tier 1: Instant processing eligible.</span>
            </div>
          )}

          {/* Processing Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/20 rounded-[16px] p-3">
            <Clock className="h-4 w-4" />
            <span>Processing time: 1-3 business days</span>
          </div>

          {isLocked && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-[16px] text-destructive text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Security lock active until {new Date(lockExpiresAt!).toLocaleString()}</span>
            </div>
          )}

          {/* Withdraw Button */}
          <Button
            onClick={handleWithdraw}
            disabled={!amount || withdrawalAmount <= 0 || withdrawalAmount > availableBalance || !selectedMethod || loading || securityLoading || isLocked}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Withdrawal'
            )}
          </Button>
        </div>
      </SheetContent>

      <TransactionPinDialog
        open={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSuccess={processWithdrawal}
        loading={pinLoading}
      />
    </Sheet>
  );
};
