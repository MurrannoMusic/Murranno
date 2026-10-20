import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { BalanceTab } from '@/components/wallet/BalanceTab';
import { BalanceLoading } from '@/components/wallet/BalanceLoading';
import { PayoutMethodsTab } from '@/components/wallet/PayoutMethodsTab';
import { HistoryTab } from '@/components/wallet/HistoryTab';
import { WithdrawSheet } from '@/components/wallet/WithdrawSheet';
import { PageTitle, Segmented } from '@/components/layout/PagePrimitives';
import { useWallet } from '@/hooks/useWallet';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorState } from '@/components/states/StateViews';

const TABS = [
  { value: 'balance', label: 'Balance' },
  { value: 'methods', label: 'Payout Methods' },
  { value: 'history', label: 'History' },
] as const;

export const Earnings = () => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['value']>('balance');
  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { transactions, allTransactions, statusFilter, setStatusFilter, typeFilter, setTypeFilter, earningsSources, loading: walletLoading, error: walletError, refetch: refetchWallet } = useWallet();
  const { balance, loading: balanceLoading, error: balanceError, refetch: refetchBalance } = useWalletBalance();

  // Same rule as the Expo app: payouts need a verified identity.
  const handleWithdraw = () => {
    if (profile?.kyc_status !== 'verified') {
      toast('Verification required', {
        description: 'Verify your identity before withdrawing.',
        action: { label: 'Verify', onClick: () => navigate('/app/kyc') },
      });
      return;
    }
    setShowWithdrawSheet(true);
  };

  const empty = !balance || (balance.available_balance === 0 && balance.total_earnings === 0);

  return (
    <div className="px-6 pb-10 space-y-5">
      <PageTitle>Earnings</PageTitle>
      <Segmented<(typeof TABS)[number]['value']> options={TABS} value={activeTab} onChange={setActiveTab} label="Earnings sections" className="rounded-xl" />

      {activeTab === 'balance' &&
        (balanceLoading ? (
          <BalanceLoading />
        ) : balanceError ? (
          <ErrorState error={balanceError} title="Couldn’t load your balance" onRetry={refetchBalance} />
        ) : empty ? (
          <div className="rounded-xl border border-border bg-card px-6 py-10 text-center space-y-2">
            <Wallet className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-base font-bold">No balance yet</p>
            <p className="text-sm text-muted-foreground">Earnings will appear here once your music starts streaming</p>
          </div>
        ) : (
          <BalanceTab balance={balance} earningsSources={earningsSources} onWithdraw={handleWithdraw} />
        ))}

      {activeTab === 'methods' && <PayoutMethodsTab />}

      {activeTab === 'history' && (
        <HistoryTab
          transactions={transactions}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onStatusFilterChange={setStatusFilter}
          onTypeFilterChange={setTypeFilter}
          loading={walletLoading}
          error={walletError}
          onRetry={refetchWallet}
          totalCount={allTransactions.length}
        />
      )}

      {balance && (
        <WithdrawSheet
          open={showWithdrawSheet}
          onClose={() => setShowWithdrawSheet(false)}
          availableBalance={balance.available_balance}
          onSuccess={refetchBalance}
        />
      )}
    </div>
  );
};
