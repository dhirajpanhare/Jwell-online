import { cartApi } from '../api/dynamicApiService';
import { getAuthToken, getCurrentUser } from '../api/authApi';

/**
 * Get user's cart
 * @returns {Promise<Array>} Array of cart items
 */
export const getCart = async () => {
  try {
    const token = getAuthToken();
    if (!token) return [];

    const user = getCurrentUser();
    if (!user) return [];

    const result = await cartApi.getCart(user.userId);
    return result.status ? (Array.isArray(result.data) ? result.data : []) : [];
  } catch (error) {
    console.error('Error fetching cart:', error);
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
    const user = getCurrentUser();
    if (!user) throw new Error('User must be authenticated to add to cart');

    const result = await cartApi.addCartItem(user.userId, productId, quantity);
    return result;
  } catch (error) {
    console.error(`Error adding product ${productId} to cart:`, error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {number|string} cartItemId - Cart Item ID (from SP_GetCart)
 * @param {number} quantity - New quantity
 * @returns {Promise<object>} Result of the operation
 */
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User must be authenticated to update cart');

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    // SP_UpdateCartItem expects (p_CartItemId, p_UserId, p_Quantity)
    const result = await cartApi.updateCartItem(cartItemId, user.userId, quantity);
    return result;
  } catch (error) {
    console.error(`Error updating cart item ${cartItemId}:`, error);
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {number|string} cartItemId - Cart Item ID (from SP_GetCart)
 * @returns {Promise<object>} Result of the operation
 */
export const removeFromCart = async (cartItemId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User must be authenticated to remove from cart');

    // SP_RemoveCartItem expects (p_CartItemId, p_UserId)
    const result = await cartApi.removeCartItem(cartItemId, user.userId);
    return result;
  } catch (error) {
    console.error(`Error removing cart item ${cartItemId} from cart:`, error);
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise<object>} Result of the operation
 */
export const clearCart = async () => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User must be authenticated to clear cart');

    const result = await cartApi.clearCart(user.userId);
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
