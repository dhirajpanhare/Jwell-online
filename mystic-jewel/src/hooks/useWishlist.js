import { useState, useCallback, useEffect } from 'react';
import { getAuthToken } from '../api/authApi';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist as checkIsInWishlist,
} from '../services/wishlistService';

/**
 * Custom hook for managing wishlist
 * Falls back to localStorage for unauthenticated users
 */
export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isAuthenticated = !!getAuthToken();

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Sync with server on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      syncWishlist();
    }
  }, [isAuthenticated]);

  const syncWishlist = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getWishlist();
      setWishlistItems(data);
    } catch (err) {
      setError(err.message || 'Failed to sync wishlist');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const toggleWishlist = useCallback(
    async (product) => {
      const productId = product.ProductId || product.id;
      const exists = wishlistItems.find(item => (item.ProductId || item.id) === productId);

      if (exists) {
        if (isAuthenticated) {
          try { await removeFromWishlist(productId); } catch (err) { setError(err.message); return; }
        }
        setWishlistItems(prev => prev.filter(item => (item.ProductId || item.id) !== productId));
      } else {
        if (isAuthenticated) {
          try { await addToWishlist(productId); } catch (err) { setError(err.message); return; }
        }
        setWishlistItems(prev => [...prev, { ...product, id: productId }]);
      }
    },
    [wishlistItems, isAuthenticated]
  );

  const addToWishlistItem = useCallback(
    async (product) => {
      const productId = product.ProductId || product.id;
      const exists = wishlistItems.find(item => (item.ProductId || item.id) === productId);
      if (exists) return;
      if (isAuthenticated) {
        try { await addToWishlist(productId); } catch (err) { setError(err.message); return; }
      }
      setWishlistItems(prev => [...prev, { ...product, id: productId }]);
    },
    [wishlistItems, isAuthenticated]
  );

  const removeFromWishlistItem = useCallback(
    async (productId) => {
      if (isAuthenticated) {
        try { await removeFromWishlist(productId); } catch (err) { setError(err.message); return; }
      }
      setWishlistItems(prev => prev.filter(item => (item.ProductId || item.id) !== productId));
    },
    [isAuthenticated]
  );

  const isInWishlist = useCallback(
    (productId) => wishlistItems.some(item => (item.ProductId || item.id) === productId),
    [wishlistItems]
  );

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  return {
    wishlistItems,
    loading,
    error,
    toggleWishlist,
    addToWishlist: addToWishlistItem,
    removeFromWishlist: removeFromWishlistItem,
    isInWishlist,
    clearWishlist,
    syncWishlist,
  };
};

export default useWishlist;
