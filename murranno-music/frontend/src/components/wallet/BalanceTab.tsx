import { DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EarningsSource } from '@/types/wallet';
import { WalletBalance } from '@/hooks/useWalletBalance';
import { EarningsSourceCard } from './EarningsSourceCard';
import { WalletBalanceCard } from './WalletBalanceCard';

interface BalanceTabProps {
  balance: WalletBalance;
  earningsSources: EarningsSource[];
  onWithdraw: () => void;
}

export const BalanceTab = ({ balance, earningsSources, onWithdraw }: BalanceTabProps) => {
  const percentageChange = balance.total_earnings > 0
    ? ((balance.available_balance / balance.total_earnings) * 100).toFixed(1)
    : 0;
  return (
    <div className="space-y-3">
      {/* Premium Balance Card */}
      <WalletBalanceCard balance={balance} onWithdraw={onWithdraw} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-card border border-border rounded-xl p-3 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-right">
              <div className="text-[10px] text-success font-medium">+{percentageChange}%</div>
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-lg font-bold text-card-foreground">₦{balance.total_earnings.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Earnings</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-right">
              <div className="text-[10px] text-success font-medium">+8%</div>
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-lg font-bold text-card-foreground">₦{(balance.total_earnings * 0.15).toFixed(2)}</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">This Month</div>
          </div>
        </div>
      </div>

      {/* Earnings Sources */}
      <Card className="bg-card border border-border rounded-xl shadow-soft">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold text-card-foreground uppercase tracking-wider">Earnings by Source</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {earningsSources.map((source) => (
            <EarningsSourceCard key={source.id} source={source} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
