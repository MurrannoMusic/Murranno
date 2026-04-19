/**
 * React Native Cart Context
 * Manages shopping cart for promotion services and bundles
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  type: 'service' | 'bundle';
  serviceId?: string;
  bundleId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Sync cart with database
  const syncCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          service_id,
          bundle_id,
          promotion_services (id, name, price, image_url),
          promotion_bundles (id, name, price, image_url)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const cartItems: CartItem[] = (data || []).map((item: any) => {
        const isService = !!item.service_id;
        const details = isService ? item.promotion_services : item.promotion_bundles;
        
        return {
          id: item.id,
          type: isService ? 'service' : 'bundle',
          serviceId: item.service_id,
          bundleId: item.bundle_id,
          name: details?.name || 'Unknown',
          price: details?.price || 0,
          quantity: item.quantity || 1,
          imageUrl: details?.image_url,
        };
      });

      setItems(cartItems);
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart on mount and when user changes
  useEffect(() => {
    syncCart();
  }, [syncCart]);

  const addItem = useCallback(async (item: Omit<CartItem, 'id' | 'quantity'>) => {
    if (!user) return;

    setLoading(true);
    try {
      // Check if item already exists
      const existingItem = items.find(
        i => (item.type === 'service' && i.serviceId === item.serviceId) ||
             (item.type === 'bundle' && i.bundleId === item.bundleId)
      );

      if (existingItem) {
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            service_id: item.serviceId,
            bundle_id: item.bundleId,
            quantity: 1,
          });

        if (error) throw error;
        await syncCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user, items, syncCart]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!user || quantity < 1) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
