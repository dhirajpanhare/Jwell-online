/**
 * Safe localStorage wrapper with JSON serialization
 */

export const storage = {
  /**
   * Get item from localStorage
   */
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  },

  /**
   * Remove item from localStorage
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  },

  /**
   * Clear all localStorage
   */
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  /**
   * Check if item exists in localStorage
   */
  hasItem: (key) => {
    return localStorage.getItem(key) !== null;
  },
};

/**
 * Auth storage helpers
 */
export const authStorage = {
  setToken: (token) => storage.setItem('authToken', token),
  getToken: () => storage.getItem('authToken'),
  removeToken: () => storage.removeItem('authToken'),
  hasToken: () => storage.hasItem('authToken'),

  setUser: (user) => storage.setItem('user', user),
  getUser: () => storage.getItem('user'),
  removeUser: () => storage.removeItem('user'),
  hasUser: () => storage.hasItem('user'),
};

/**
 * Cart storage helpers
 */
export const cartStorage = {
  setCart: (items) => storage.setItem('cart', items),
  getCart: () => storage.getItem('cart', []),
  removeCart: () => storage.removeItem('cart'),
  clearCart: () => storage.removeItem('cart'),
};

/**
 * Wishlist storage helpers
 */
export const wishlistStorage = {
  setWishlist: (items) => storage.setItem('wishlist', items),
  getWishlist: () => storage.getItem('wishlist', []),
  removeWishlist: () => storage.removeItem('wishlist'),
  clearWishlist: () => storage.removeItem('wishlist'),
};

export default storage;
