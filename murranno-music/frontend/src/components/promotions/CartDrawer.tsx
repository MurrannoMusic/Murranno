import { ShoppingCart, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { usePromotionBundles } from '@/hooks/usePromotionBundles';
import { CartItem } from './CartItem';
import { PriceSummary } from './PriceSummary';
import { BundleRecommendations } from './BundleRecommendations';
import { PromotionBundle } from '@/types/promotion';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCampaign: () => void;
  onSelectBundle: (bundle: PromotionBundle) => void;
}

export const CartDrawer = ({ open, onOpenChange, onCreateCampaign, onSelectBundle }: CartDrawerProps) => {
  const { items, itemCount, totalPrice, removeFromCart, clearCart } = useCart();
  const { bundles } = usePromotionBundles();

  const handleCreateCampaign = () => {
    onCreateCampaign();
    onOpenChange(false);
  };

  const handleSelectBundle = (bundle: PromotionBundle) => {
    clearCart();
    onSelectBundle(bundle);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </span>
            {itemCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            {itemCount === 0 
              ? 'Your cart is empty' 
              : `${itemCount} ${itemCount === 1 ? 'service' : 'services'} selected`
            }
          </SheetDescription>
        </SheetHeader>

        {itemCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">
              Browse services to get started
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 py-4">
                {items.map((item) => (
                  <CartItem
                    key={item.service.id}
                    service={item.service}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              <Separator className="my-4" />

              <BundleRecommendations
                cartServices={items.map(item => item.service)}
                cartTotal={totalPrice}
                bundles={bundles}
                onSelectBundle={handleSelectBundle}
              />
            </ScrollArea>

            <SheetFooter className="flex-col space-y-4">
              <PriceSummary itemCount={itemCount} totalPrice={totalPrice} />
              <Button onClick={handleCreateCampaign} className="w-full" size="lg">
                Create Campaign
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
