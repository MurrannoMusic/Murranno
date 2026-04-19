import { Building2, Smartphone, CreditCard, CheckCircle2, Star, Copy } from 'lucide-react';
import { PayoutMethod } from '@/types/wallet';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';

interface PayoutMethodCardProps {
  method: PayoutMethod;
}

const iconMap = {
  Building2,
  Smartphone,
  CreditCard,
};

const methodColors = {
  bank: 'from-primary/10 to-primary/5 border-primary/20',
  mobile_money: 'from-success/10 to-success/5 border-success/20',
  payoneer: 'from-accent/10 to-accent/5 border-accent/20',
  paypal: 'from-secondary/10 to-secondary/5 border-secondary/20',
};

const iconColors = {
  bank: 'bg-primary/20 text-primary',
  mobile_money: 'bg-success/20 text-success',
  payoneer: 'bg-accent/20 text-accent',
  paypal: 'bg-secondary/20 text-secondary',
};

const verifiedColors = {
  bank: 'text-primary',
  mobile_money: 'text-success',
  payoneer: 'text-accent',
  paypal: 'text-secondary',
};

export const PayoutMethodCard = ({ method }: PayoutMethodCardProps) => {
  const Icon = iconMap[method.icon as keyof typeof iconMap] || Building2;
  const { copyAccountNumber } = useClipboard();

  return (
    <div className={cn(
      "bg-gradient-to-br border-2 rounded-[16px] p-4",
      methodColors[method.type]
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          iconColors[method.type]
        )}>
          <Icon className="h-6 w-6" />
        </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-card-foreground">{method.name}</h3>
                  {method.isPrimary && (
                    <Star className="h-4 w-4 text-accent fill-accent flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-muted-foreground">{method.details}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAccountNumber(method.details)}
                    className="h-5 w-5 p-0 hover:bg-transparent"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          <div className="flex items-center gap-1 mt-2">
            <CheckCircle2 className={cn("h-4 w-4", verifiedColors[method.type])} />
            <span className={cn("text-sm font-semibold", verifiedColors[method.type])}>
              {method.verified ? 'Confirmed' : 'Pending Verification'}
            </span>
          </div>
          {method.lastUsed && (
            <p className="text-xs text-muted-foreground mt-1">
              Last used: {new Date(method.lastUsed).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
