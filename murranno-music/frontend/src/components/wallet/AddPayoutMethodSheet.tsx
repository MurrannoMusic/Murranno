import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/forms/FieldError';
import { ErrorState, SuccessState, friendlyError } from '@/components/states/StateViews';
import { accountNumber as accountNumberRule, fieldA11y } from '@/lib/validation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle } from 'lucide-react';

interface Bank {
  id: number;
  name: string;
  code: string;
}

interface AddPayoutMethodSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPayoutMethodSheet = ({ open, onClose, onSuccess }: AddPayoutMethodSheetProps) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errors, setErrors] = useState<{ bank?: string; account?: string; form?: string }>({});
  const [banksError, setBanksError] = useState<unknown>(null);
  const [added, setAdded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchBanks();
    }
  }, [open]);

  const fetchBanks = async () => {
    try {
      setBanksError(null);
      const { data, error } = await supabase.functions.invoke('paystack-get-banks');

      if (error) throw error;

      if (data.success) {
        setBanks(data.data);
      }
    } catch (error: any) {
      console.error('Error fetching banks:', error);
      setBanksError(error);
    }
  };

  const verifyAccount = async () => {
    const found = { bank: selectedBank ? undefined : 'Choose your bank', account: accountNumberRule(accountNumber) || undefined };
    setErrors(found);
    if (found.bank || found.account) return;

    try {
      setVerifying(true);
      setAccountName('');
      setVerified(false);

      const { data, error } = await supabase.functions.invoke('paystack-resolve-account', {
        body: {
          account_number: accountNumber,
          bank_code: selectedBank,
        },
      });

      if (error) throw error;

      if (data.success) {
        setAccountName(data.data.account_name);
        setVerified(true);
      } else {
        throw new Error(data.error || 'Failed to verify account');
      }
    } catch (error: any) {
      console.error('Error verifying account:', error);
      setErrors({ account: friendlyError(error).kind === 'offline' ? friendlyError(error).message : 'We couldn’t find this account at the selected bank. Check the number and bank.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!verified || !accountName) {
      void verifyAccount();
      return;
    }

    try {
      setLoading(true);

      const bank = banks.find(b => b.code === selectedBank);

      const { data, error } = await supabase.functions.invoke('paystack-create-recipient', {
        body: {
          account_name: accountName,
          account_number: accountNumber,
          bank_code: selectedBank,
          bank_name: bank?.name || '',
        },
      });

      if (error) throw error;

      if (data.success) {
        // The 24-hour payout lock is applied by the server when the recipient is created.

        // Log Security Activity
        try {
          await supabase.from('security_logs').insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            event: 'bank_account_added',
            details: { bank_name: bank?.name ?? '', account_number: accountNumber },
            ip_address: 'browser', // IP will be captured by Supabase Auth if using RLS/Functions, but for simple logging:
            user_agent: navigator.userAgent
          });
        } catch (logError) {
          console.error('Failed to log security activity:', logError);
        }

        onSuccess();
        setAdded(true);
      } else {
        throw new Error(data.error || 'Failed to add payout method');
      }
    } catch (error: any) {
      console.error('Error adding payout method:', error);
      setErrors({ form: friendlyError(error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedBank('');
    setAccountNumber('');
    setAccountName('');
    setVerified(false);
    setErrors({});
    setAdded(false);
    onClose();
  };

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank && !verified) {
      verifyAccount();
    } else if (accountNumber.length !== 10) {
      setVerified(false);
      setAccountName('');
    }
  }, [accountNumber, selectedBank]);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Bank Account</SheetTitle>
        </SheetHeader>

        {added ? (
          <SuccessState
            className="mt-4"
            title="Bank account added"
            body={<><strong>{accountName}</strong> · {accountNumber}<br />For your security, withdrawals are paused for 24 hours after adding bank details.</>}
            action={{ label: 'Done', onClick: handleClose }}
          />
        ) : (
        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="bank">Bank</Label>
            {banksError ? <ErrorState error={banksError} title="Couldn’t load the list of banks" onRetry={fetchBanks} className="py-4" /> : (
            <Select value={selectedBank} onValueChange={(v) => { setSelectedBank(v); setErrors({}); }}>
              <SelectTrigger id="bank" {...fieldA11y('bank', errors.bank)}>
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            )}
            <FieldError id="bank" error={errors.bank} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <div className="relative">
              <Input
                id="accountNumber"
                type="text"
                maxLength={10}
                value={accountNumber}
                inputMode="numeric"
                onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '')); setErrors({}); }}
                placeholder="Enter 10-digit account number"
                {...fieldA11y('accountNumber', errors.account)}
              />
              {verifying && (
                <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-muted-foreground" />
              )}
              {verified && (
                <CheckCircle className="h-4 w-4 absolute right-3 top-3 text-success" />
              )}
            </div>
            <FieldError id="accountNumber" error={errors.account} />
          </div>

          {accountName && (
            <div className="space-y-2">
              <Label>Account Name</Label>
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-medium text-success">{accountName}</p>
              </div>
            </div>
          )}

          {errors.form && <p role="alert" className="text-sm text-destructive">{errors.form}</p>}

          <Button
            onClick={handleSubmit}
            disabled={loading || verifying}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Account...
              </>
            ) : (
              'Add Bank Account'
            )}
          </Button>
        </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
