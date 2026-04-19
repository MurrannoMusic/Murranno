import { DollarSign, Clock, ArrowUpRight, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WalletBalance } from '@/hooks/useWalletBalance';

interface WalletBalanceCardProps {
    balance: WalletBalance;
    onWithdraw: () => void;
}

export const WalletBalanceCard = ({ balance, onWithdraw }: WalletBalanceCardProps) => {
    return (
        <Card className="bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] border-[#333] overflow-hidden rounded-xl shadow-glow">
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-semibold">Available Balance</span>
                        <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                            <span className="text-xl font-medium text-muted-foreground">₦</span>
                            {Number(balance.available_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg backdrop-blur-md border border-white/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                            <Clock className="h-3 w-3" />
                            PENDING
                        </div>
                        <p className="text-sm font-bold text-white">
                            ₦{Number(balance.pending_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium justify-end">
                            <ArrowUpRight className="h-3 w-3" />
                            TOTAL EARNED
                        </div>
                        <p className="text-sm font-bold text-white">
                            ₦{Number(balance.total_earnings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <Button
                        onClick={onWithdraw}
                        className="flex-1 bg-white text-black hover:bg-white/90 font-bold h-10 rounded-lg text-xs"
                    >
                        Withdraw Funds
                    </Button>
                    <Button
                        variant="outline"
                        className="w-10 h-10 p-0 border-[#444] hover:bg-white/5 rounded-lg shrink-0"
                    >
                        <Plus className="h-4 w-4 text-white" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
