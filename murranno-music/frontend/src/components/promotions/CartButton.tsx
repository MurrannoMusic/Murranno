import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

interface CartButtonProps {
  onClick: () => void;
}

export const CartButton = ({ onClick }: CartButtonProps) => {
  const { itemCount } = useCart();

  if (itemCount === 0) return null;

  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
        "md:bottom-6",
        itemCount > 0 && "animate-pulse"
      )}
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );
};
