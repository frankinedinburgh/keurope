import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI, CartItem, Product } from '../services/api';

export type { Product, CartItem };

interface CartContextType {
  cart: CartItem[];
  items: CartItem[];
  addToCart: (product: Product, quantity: number, size: string) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  updateQuantity: (cartId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  total: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();

  // Load cart from backend when auth changes
  useEffect(() => {
    if (isAuthenticated && token) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated, token]);

  const loadCart = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await cartAPI.get(token);
      setCart(data.items);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1, size: string) => {
    if (!token) return;

    try {
      const data = await cartAPI.add(token, product.id, quantity, size);
      setCart((prev) => {
        const existing = prev.find((item) => item.product_id === product.id && item.size === size);
        if (existing) {
          return prev.map((item) =>
            item.id === existing.id ? { ...item, quantity: data.quantity } : item
          );
        }
        return [...prev, data];
      });
    } catch (err) {
      console.error('Failed to add to cart:', err);
      throw err;
    }
  };

  const removeFromCart = async (cartId: string) => {
    if (!token) return;

    try {
      await cartAPI.remove(token, cartId);
      setCart((prev) => prev.filter((item) => item.id !== cartId));
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      throw err;
    }
  };

  const updateQuantity = async (cartId: string, quantity: number) => {
    if (!token) return;

    if (quantity <= 0) {
      await removeFromCart(cartId);
      return;
    }

    try {
      const data = await cartAPI.updateQuantity(token, cartId, quantity);
      setCart((prev) =>
        prev.map((item) => (item.id === cartId ? { ...item, quantity: data.quantity } : item))
      );
    } catch (err) {
      console.error('Failed to update quantity:', err);
      throw err;
    }
  };

  const clearCart = async () => {
    if (!token) return;

    try {
      await cartAPI.clear(token);
      setCart([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      throw err;
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loadCart,
        totalItems,
        totalPrice,
        total: totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
