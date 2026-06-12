import { useState, useCallback, useEffect } from 'react';
import { getAuthToken } from '../api/authApi';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart as clearCartAPI,
} from '../services/cartService';

/**
 * Custom hook for managing cart
 * Falls back to localStorage for unauthenticated users
 */
export const useCart = () => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isAuthenticated = !!getAuthToken();

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync with server on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      syncCart();
    }
  }, [isAuthenticated]);

  const syncCart = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setCartItems(data);
    } catch (err) {
      setError(err.message || 'Failed to sync cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (isAuthenticated) {
        setLoading(true);
        setError(null);
        try {
          await addToCart(product.id, quantity);
        } catch (err) {
          setError(err.message || 'Failed to add to cart');
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }

      setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity }];
      });
    },
    [isAuthenticated]
  );

  const updateItem = useCallback(
    async (productId, quantity) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      if (isAuthenticated) {
        setLoading(true);
        setError(null);
        try {
          await updateCartItem(productId, quantity);
        } catch (err) {
          setError(err.message || 'Failed to update cart');
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }

      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    },
    [isAuthenticated]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (isAuthenticated) {
        setLoading(true);
        setError(null);
        try {
          await removeFromCart(productId);
        } catch (err) {
          setError(err.message || 'Failed to remove from cart');
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }

      setCartItems(prev => prev.filter(item => item.id !== productId));
    },
    [isAuthenticated]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true);
      setError(null);
      try {
        await clearCartAPI();
      } catch (err) {
        setError(err.message || 'Failed to clear cart');
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    setCartItems([]);
  }, [isAuthenticated]);

  const getTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  }, [cartItems]);

  const getCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  }, [cartItems]);

  const isInCart = useCallback(
    (productId) => {
      return cartItems.some(item => item.id === productId);
    },
    [cartItems]
  );

  return {
    cartItems,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getTotal,
    getCount,
    isInCart,
    syncCart,
  };
};

export default useCart;
