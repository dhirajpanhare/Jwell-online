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
      // Support both real API (ProductId) and mock (id)
      const productId = product.ProductId || product.id;

      if (isAuthenticated) {
        setLoading(true);
        setError(null);
        try {
          await addToCart(productId, quantity);
        } catch (err) {
          setError(err.message || 'Failed to add to cart');
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }

      setCartItems(prev => {
        const existing = prev.find(item => (item.ProductId || item.id) === productId);
        if (existing) {
          return prev.map(item =>
            (item.ProductId || item.id) === productId
              ? { ...item, quantity: (item.quantity || item.Quantity || 1) + quantity }
              : item
          );
        }
        return [...prev, { ...product, id: productId, quantity }];
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

      // Find the cart item by ProductId to get CartItemId
      const cartItem = cartItems.find(item => (item.ProductId || item.id) === productId);
      if (!cartItem) {
        setError('Item not found in cart');
        return;
      }

      const cartItemId = cartItem.CartItemId;

      if (isAuthenticated) {
        setLoading(true);
        setError(null);
        try {
          // Pass CartItemId and quantity to the API
          await updateCartItem(cartItemId, quantity);
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
          (item.ProductId || item.id) === productId ? { ...item, quantity } : item
        )
      );
    },
    [isAuthenticated, cartItems]
  );

  const removeItem = useCallback(
    async (productId) => {
      // Find the cart item by ProductId to get CartItemId
      const cartItem = cartItems.find(item => (item.ProductId || item.id) === productId);
      if (!cartItem) {
        setError('Item not found in cart');
        return;
      }

      const cartItemId = cartItem.CartItemId;

      if (isAuthenticated) {
        setLoading(true);
        setError(null);
        try {
          // Pass CartItemId to the API
          await removeFromCart(cartItemId);
        } catch (err) {
          setError(err.message || 'Failed to remove from cart');
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }

      setCartItems(prev => prev.filter(item => (item.ProductId || item.id) !== productId));
    },
    [isAuthenticated, cartItems]
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
    return cartItems.reduce((total, item) => {
      const price = item.Price || item.price || 0;
      const qty = item.Quantity || item.quantity || 1;
      return total + price * qty;
    }, 0);
  }, [cartItems]);

  const getCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + (item.Quantity || item.quantity || 1), 0);
  }, [cartItems]);

  const isInCart = useCallback(
    (productId) => {
      return cartItems.some(item => (item.ProductId || item.id) === productId);
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
