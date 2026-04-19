import { EarningsTransaction } from '@/types/wallet';
import { cn } from '@/lib/utils';

interface TransactionRowProps {
  transaction: EarningsTransaction;
  index: number;
  onClick: () => void;
}

const statusColors = {
  paid: 'text-success',
  pending: 'text-yellow-600',
  processing: 'text-blue-600',
  failed: 'text-destructive',
  cancelled: 'text-muted-foreground',
};

export const TransactionRow = ({ transaction, index, onClick }: TransactionRowProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    }).replace(/\//g, '.');
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "grid grid-cols-4 gap-4 px-4 py-4 items-center cursor-pointer transition-colors hover:bg-secondary/20",
        index % 2 === 0 ? "bg-primary/5" : "bg-background"
      )}
    >
      <div className="font-bold text-sm text-card-foreground">
        {transaction.currency}{transaction.amount.toFixed(2)}
      </div>
      <div className="text-sm text-muted-foreground capitalize truncate">
        {transaction.source || transaction.method}
      </div>
      <div className="text-sm text-muted-foreground">
        {formatDate(transaction.requestedDate)}
      </div>
      <div className={cn(
        "text-sm font-semibold capitalize",
        statusColors[transaction.status]
      )}>
        {transaction.status}
      </div>
    </div>
  );
};
