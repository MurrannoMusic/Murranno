import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchBanks();
    }
  }, [open]);

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('paystack-get-banks');

      if (error) throw error;

      if (data.success) {
        setBanks(data.data);
      }
    } catch (error: any) {
      console.error('Error fetching banks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load banks',
        variant: 'destructive',
      });
    }
  };

  const verifyAccount = async () => {
    if (!selectedBank || !accountNumber || accountNumber.length !== 10) {
      toast({
        title: 'Invalid Input',
        description: 'Please select a bank and enter a valid 10-digit account number',
        variant: 'destructive',
      });
      return;
    }

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
        toast({
          title: 'Account Verified',
          description: `Account holder: ${data.data.account_name}`,
        });
      } else {
        throw new Error(data.error || 'Failed to verify account');
      }
    } catch (error: any) {
      console.error('Error verifying account:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Could not verify account details',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!verified || !accountName) {
      toast({
        title: 'Error',
        description: 'Please verify your account first',
        variant: 'destructive',
      });
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
        // Set security lock for 24 hours after bank details change
        const lockUntil = new Date();
        lockUntil.setHours(lockUntil.getHours() + 24);

        await supabase.from('profiles').update({
          payout_lock_until: lockUntil.toISOString()
        }).eq('id', (await supabase.auth.getUser()).data.user?.id);

        toast({
          title: 'Success',
          description: 'Bank account added successfully. A 24-hour security lock is now active.',
        });

        // Log Security Activity
        try {
          await supabase.from('security_logs').insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            event: 'bank_account_added',
            details: { bank_name: selectedBankName, account_number: accountNumber },
            ip_address: 'browser', // IP will be captured by Supabase Auth if using RLS/Functions, but for simple logging:
            user_agent: navigator.userAgent
          });
        } catch (logError) {
          console.error('Failed to log security activity:', logError);
        }

        onSuccess();
        handleClose();
      } else {
        throw new Error(data.error || 'Failed to add payout method');
      }
    } catch (error: any) {
      console.error('Error adding payout method:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add bank account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedBank('');
    setAccountNumber('');
    setAccountName('');
    setVerified(false);
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

        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="bank">Bank</Label>
            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <div className="relative">
              <Input
                id="accountNumber"
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit account number"
              />
              {verifying && (
                <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-muted-foreground" />
              )}
              {verified && (
                <CheckCircle className="h-4 w-4 absolute right-3 top-3 text-success" />
              )}
            </div>
          </div>

          {accountName && (
            <div className="space-y-2">
              <Label>Account Name</Label>
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-medium text-success">{accountName}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!verified || loading}
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
      </SheetContent>
    </Sheet>
  );
};
