import React, { createContext, useState, useEffect, useCallback } from 'react';
import { PromotionService } from '@/types/promotion';

interface CartItem {
  service: PromotionService;
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  itemCount: number;
}

interface CartContextType extends CartState {
  addToCart: (service: PromotionService) => void;
  removeFromCart: (serviceId: string) => void;
  clearCart: () => void;
  isInCart: (serviceId: string) => boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'promo-cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        })));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totalPrice = items.reduce((sum, item) => sum + item.service.price, 0);
  const itemCount = items.length;

  const addToCart = useCallback((service: PromotionService) => {
    setItems((prev) => {
      if (prev.some((item) => item.service.id === service.id)) {
        return prev;
      }
      return [...prev, { service, addedAt: new Date() }];
    });
  }, []);

  const removeFromCart = useCallback((serviceId: string) => {
    setItems((prev) => prev.filter((item) => item.service.id !== serviceId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (serviceId: string) => items.some((item) => item.service.id === serviceId),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalPrice,
        itemCount,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
