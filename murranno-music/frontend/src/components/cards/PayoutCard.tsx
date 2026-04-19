import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Payout } from '@/types/payout';

interface PayoutCardProps {
  payout: Payout;
  getStatusBadgeVariant: (status: string) => string;
  isLabel?: boolean;
  onApprove?: (id: number) => void;
  onViewDetails?: (id: number) => void;
}

export const PayoutCard = ({ 
  payout, 
  getStatusBadgeVariant, 
  isLabel = false,
  onApprove,
  onViewDetails
}: PayoutCardProps) => {
  return (
    <div className="interactive-element p-4 bg-muted/20 rounded-xl border border-border/10">
      <div className="space-y-3">
        {/* Payout Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{payout.artist}</h3>
              <Badge variant={getStatusBadgeVariant(payout.status) as any} className="text-xs">
                {payout.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{payout.period}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{payout.amount}</p>
            <p className="text-xs text-muted-foreground">{payout.streams} streams</p>
          </div>
        </div>

        {/* Payout Details */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/10 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Request Date</p>
            <p className="font-semibold">{new Date(payout.requestDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Type</p>
            <p className="font-semibold">{payout.type}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {payout.status === 'Pending' && (
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs h-8"
              onClick={() => onViewDetails?.(payout.id)}
            >
              View Details
            </Button>
            {isLabel && (
              <Button 
                size="sm" 
                className="flex-1 text-xs h-8 gradient-primary"
                onClick={() => onApprove?.(payout.id)}
              >
                Approve
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};