import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EarningsTransaction } from '@/types/wallet';
import { TransactionRow } from './TransactionRow';
import { TransactionDetailsSheet } from './TransactionDetailsSheet';

interface HistoryTabProps {
  transactions: EarningsTransaction[];
  statusFilter: string;
  typeFilter: string;
  onStatusFilterChange: (status: string) => void;
  onTypeFilterChange: (type: string) => void;
}

export const HistoryTab = ({ 
  transactions, 
  statusFilter, 
  typeFilter,
  onStatusFilterChange,
  onTypeFilterChange 
}: HistoryTabProps) => {
  const [selectedTransaction, setSelectedTransaction] = useState<EarningsTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-card border border-border rounded-[20px] shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-card-foreground">Filters</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="px-3 py-2 rounded-lg bg-secondary/30 text-sm border border-border text-foreground"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </select>
              <select 
                value={typeFilter}
                onChange={(e) => onTypeFilterChange(e.target.value)}
                className="px-3 py-2 rounded-lg bg-secondary/30 text-sm border border-border text-foreground"
              >
                <option value="all">All Types</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="earning">Earning</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-card border border-border rounded-[20px] shadow-soft overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-card-foreground">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-secondary/30 border-b border-border">
            <div className="text-xs font-semibold text-muted-foreground">Payout</div>
            <div className="text-xs font-semibold text-muted-foreground">Type</div>
            <div className="text-xs font-semibold text-muted-foreground">Requested</div>
            <div className="text-xs font-semibold text-muted-foreground">Status</div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-border">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No transactions found
              </div>
            ) : (
              transactions.map((transaction, index) => (
                <TransactionRow 
                  key={transaction.id} 
                  transaction={transaction}
                  index={index}
                  onClick={() => setSelectedTransaction(transaction)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Sheet */}
      <TransactionDetailsSheet 
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};
