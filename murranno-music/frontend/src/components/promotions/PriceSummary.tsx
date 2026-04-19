import { Separator } from '@/components/ui/separator';

interface PriceSummaryProps {
  itemCount: number;
  totalPrice: number;
}

export const PriceSummary = ({ itemCount, totalPrice }: PriceSummaryProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-3">
      <Separator />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{itemCount} {itemCount === 1 ? 'service' : 'services'}</span>
        <span>Subtotal</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold text-primary">
          {formatPrice(totalPrice)}
        </span>
      </div>
    </div>
  );
};
