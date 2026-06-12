import { executeProcedure } from '../api/dynamicApi';
import { getAuthToken } from '../api/authApi';

/**
 * Get user's cart
 * @returns {Promise<Array>} Array of cart items
 */
export const getCart = async () => {
  try {
    if (!getAuthToken()) {
      // If not authenticated, return empty array
      return [];
    }

    const result = await executeProcedure('SP_GetCart', {});
    return Array.isArray(result) ? result : result?.data || [];
  } catch (error) {
    console.error('Error fetching cart:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * Add item to cart
 * @param {number|string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<object>} Result of the operation
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    if (!getAuthToken()) {
      throw new Error('User must be authenticated to add to cart');
    }

    const result = await executeProcedure('SP_AddCartItem', {
      p_ProductId: productId,
      p_Quantity: quantity,
    });
    return result;
  } catch (error) {
    console.error(`Error adding product ${productId} to cart:`, error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {number|string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise<object>} Result of the operation
 */
export const updateCartItem = async (productId, quantity) => {
  try {
    if (!getAuthToken()) {
      throw new Error('User must be authenticated to update cart');
    }

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    const result = await executeProcedure('SP_UpdateCartItem', {
      p_ProductId: productId,
      p_Quantity: quantity,
    });
    return result;
  } catch (error) {
    console.error(`Error updating cart item ${productId}:`, error);
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {number|string} productId - Product ID
 * @returns {Promise<object>} Result of the operation
 */
export const removeFromCart = async (productId) => {
  try {
    if (!getAuthToken()) {
      throw new Error('User must be authenticated to remove from cart');
    }

    const result = await executeProcedure('SP_RemoveCartItem', {
      p_ProductId: productId,
    });
    return result;
  } catch (error) {
    console.error(`Error removing product ${productId} from cart:`, error);
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise<object>} Result of the operation
 */
export const clearCart = async () => {
  try {
    if (!getAuthToken()) {
      throw new Error('User must be authenticated to clear cart');
    }

    const result = await executeProcedure('SP_ClearCart', {});
    return result;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
