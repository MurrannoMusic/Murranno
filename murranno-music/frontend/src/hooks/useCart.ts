import { useContext } from 'react';
import { CartContext } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { PromotionService } from '@/types/promotion';

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  const addToCartWithToast = (service: PromotionService) => {
    if (context.isInCart(service.id)) {
      toast.info('Service already in cart');
      return;
    }
    context.addToCart(service);
    toast.success('Added to cart');
  };

  const removeFromCartWithToast = (serviceId: string) => {
    context.removeFromCart(serviceId);
    toast.success('Removed from cart');
  };

  const clearCartWithToast = () => {
    context.clearCart();
    toast.success('Cart cleared');
  };

  return {
    ...context,
    addToCart: addToCartWithToast,
    removeFromCart: removeFromCartWithToast,
    clearCart: clearCartWithToast,
  };
};
