import { executeProcedure } from '../api/dynamicApi';
import { getAuthToken } from '../api/authApi';

/**
 * Get user's wishlist
 * @returns {Promise<Array>} Array of wishlist items
 */
export const getWishlist = async () => {
  try {
    if (!getAuthToken()) {
      // If not authenticated, return empty array
      return [];
    }

    const result = await executeProcedure('SP_GetWishlist', {});
    return Array.isArray(result) ? result : result?.data || [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    // Return empty array on error instead of throwing
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
    if (!getAuthToken()) {
      throw new Error('User must be authenticated to add to wishlist');
    }

    const result = await executeProcedure('SP_AddWishlist', {
      p_ProductId: productId,
    });
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
    if (!getAuthToken()) {
      throw new Error('User must be authenticated to remove from wishlist');
    }

    const result = await executeProcedure('SP_RemoveWishlist', {
      p_ProductId: productId,
    });
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
