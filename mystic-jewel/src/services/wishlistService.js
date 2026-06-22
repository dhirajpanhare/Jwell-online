import { wishlistApi } from '../api/dynamicApiService';
import { getAuthToken, getCurrentUser } from '../api/authApi';

/**
 * Get user's wishlist
 * @returns {Promise<Array>} Array of wishlist items
 */
export const getWishlist = async () => {
  try {
    const token = getAuthToken();
    if (!token) return [];

    const user = getCurrentUser();
    if (!user) return [];

    const result = await wishlistApi.getWishlist(user.userId);
    return result.status ? (Array.isArray(result.data) ? result.data : []) : [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};

/**
 * Add product to wishlist
 * @param {number|string} productId - Product ID to add
 * @returns {Promise<object>} Result of the operation
 */
export const addToWishlist = async (productId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User must be authenticated to add to wishlist');

    const result = await wishlistApi.addWishlist(user.userId, productId);
    return result;
  } catch (error) {
    console.error(`Error adding product ${productId} to wishlist:`, error);
    throw error;
  }
};

/**
 * Remove product from wishlist
 * @param {number|string} productId - Product ID to remove
 * @returns {Promise<object>} Result of the operation
 */
export const removeFromWishlist = async (productId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User must be authenticated to remove from wishlist');

    const result = await wishlistApi.removeWishlist(user.userId, productId);
    return result;
  } catch (error) {
    console.error(`Error removing product ${productId} from wishlist:`, error);
    throw error;
  }
};

/**
 * Check if product is in wishlist
 * @param {number|string} productId - Product ID to check
 * @returns {Promise<boolean>} True if product is in wishlist
 */
export const isInWishlist = async (productId) => {
  try {
    const wishlist = await getWishlist();
    return wishlist.some(item => item.id === productId || item.productId === productId);
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
};
