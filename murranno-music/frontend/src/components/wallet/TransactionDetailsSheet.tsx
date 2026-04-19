import { Download, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { EarningsTransaction } from '@/types/wallet';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface TransactionDetailsSheetProps {
  transaction: EarningsTransaction | null;
  open: boolean;
  onClose: () => void;
}

const statusColors = {
  paid: 'text-success bg-success/10',
  pending: 'text-accent bg-accent/10',
  processing: 'text-primary bg-primary/10',
  failed: 'text-destructive bg-destructive/10',
  cancelled: 'text-muted-foreground bg-muted/10',
};

export const TransactionDetailsSheet = ({ transaction, open, onClose }: TransactionDetailsSheetProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!transaction) return null;

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-receipt', {
        body: { transactionId: transaction.transactionId },
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transaction.transactionId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Receipt downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-[24px] max-h-[90vh]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Transaction Details</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Amount */}
          <div className="text-center pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground mb-2">Amount</p>
            <p className="text-4xl font-bold text-card-foreground">
              {transaction.currency}{transaction.amount.toFixed(2)}
            </p>
            <div className={cn(
              "inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-sm font-semibold",
              statusColors[transaction.status]
            )}>
              {transaction.status.toUpperCase()}
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Transaction ID</span>
              <span className="text-sm font-semibold text-card-foreground">{transaction.transactionId}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="text-sm font-semibold text-card-foreground capitalize">{transaction.type}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Method</span>
              <span className="text-sm font-semibold text-card-foreground capitalize">{transaction.method.replace('_', ' ')}</span>
            </div>

            {transaction.source && (
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="text-sm font-semibold text-card-foreground">{transaction.source}</span>
              </div>
            )}

            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Requested</span>
              <span className="text-sm font-semibold text-card-foreground">{formatDate(transaction.requestedDate)}</span>
            </div>

            {transaction.completedDate && (
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-sm font-semibold text-card-foreground">{formatDate(transaction.completedDate)}</span>
              </div>
            )}

            {transaction.fee && (
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Fee</span>
                <span className="text-sm font-semibold text-destructive">-{transaction.currency}{transaction.fee.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between py-3">
              <span className="text-sm text-muted-foreground">Net Amount</span>
              <span className="text-sm font-bold text-success">{transaction.currency}{transaction.netAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-secondary/20 rounded-[16px] p-4">
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-card-foreground">{transaction.description}</p>
          </div>

          {/* Download Receipt */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Generating...' : 'Download Receipt'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
