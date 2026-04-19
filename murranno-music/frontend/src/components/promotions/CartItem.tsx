import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PromotionService } from '@/types/promotion';

interface CartItemProps {
  service: PromotionService;
  onRemove: (serviceId: string) => void;
}

export const CartItem = ({ service, onRemove }: CartItemProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{service.name}</h4>
        <Badge variant="secondary" className="text-xs mt-1">
          {service.category}
        </Badge>
        <p className="text-sm font-semibold text-primary mt-2">
          {formatPrice(service.price)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(service.id)}
        className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
