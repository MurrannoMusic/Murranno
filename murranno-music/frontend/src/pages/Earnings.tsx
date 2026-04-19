import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import mmLogo from "@/assets/mm_logo.png";
import { Badge } from '@/components/ui/badge';
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { WalletTabs } from '@/components/wallet/WalletTabs';
import { BalanceTab } from '@/components/wallet/BalanceTab';
import { BalanceLoading } from '@/components/wallet/BalanceLoading';
import { BalanceEmptyState } from '@/components/wallet/BalanceEmptyState';
import { PayoutMethodsTab } from '@/components/wallet/PayoutMethodsTab';
import { HistoryTab } from '@/components/wallet/HistoryTab';
import { WithdrawSheet } from '@/components/wallet/WithdrawSheet';
import { useWallet } from '@/hooks/useWallet';
import { useWalletBalance } from '@/hooks/useWalletBalance';


export const Earnings = () => {
  const [activeTab, setActiveTab] = useState('balance');
  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);

  const {
    transactions,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    earningsSources,
  } = useWallet();

  const { balance, loading: balanceLoading, refetch: refetchBalance } = useWalletBalance();

  const handleWithdraw = () => {
    setShowWithdrawSheet(true);
  };

  return (
    <div className="smooth-scroll">
      {/* Top Bar removed - using UnifiedTopBar */}      <div className="mobile-container space-y-4 mt-2">
        {/* Tab Navigation */}
        <WalletTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'balance' && (
          <>
            {balanceLoading ? (
              <BalanceLoading />
            ) : balance ? (
              balance.available_balance === 0 && balance.total_earnings === 0 ? (
                <BalanceEmptyState />
              ) : (
                <BalanceTab
                  balance={balance}
                  earningsSources={earningsSources}
                  onWithdraw={handleWithdraw}
                />
              )
            ) : (
              <BalanceEmptyState />
            )}
          </>
        )}

        {activeTab === 'methods' && (
          <PayoutMethodsTab />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            transactions={transactions}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onStatusFilterChange={setStatusFilter}
            onTypeFilterChange={setTypeFilter}
          />
        )}
      </div>

      {/* Withdraw Sheet */}
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