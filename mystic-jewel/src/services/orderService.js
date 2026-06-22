import { orderApi } from '../api/dynamicApiService';
import { getAuthToken, getCurrentUser } from '../api/authApi';

/**
 * Create a new order
 * @param {object} orderData - Order details
 * @returns {Promise<object>} Created order information
 */
export const createOrder = async (orderData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User must be authenticated to create order');

    const shippingDetails = {
      address: orderData.shippingAddress,
      city: orderData.shippingCity,
      state: orderData.shippingState,
      zipCode: orderData.shippingZipCode
    };

    const result = await orderApi.createOrder(
      user.userId,
      shippingDetails,
      orderData.paymentMethod,
      orderData.notes || ''
    );
    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get user's orders
 * @param {object} filters - Filter options (status, page, limit, etc.)
 * @returns {Promise<Array>} Array of orders
 */
export const getOrders = async (filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User must be authenticated to view orders');

    const result = await orderApi.getOrders(
      user.userId,
      filters.status || null,
      filters.page || 1,
      filters.limit || 10
    );
    return result.status ? (Array.isArray(result.data) ? result.data : []) : [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get order details by ID
 * @param {number|string} orderId - Order ID
 * @returns {Promise<object>} Order details
 */
export const getOrderDetails = async (orderId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User must be authenticated to view order details');

    const result = await orderApi.getOrderDetails(orderId);
    return result.status ? (Array.isArray(result.data) ? result.data[0] : result.data) : null;
  } catch (error) {
    console.error(`Error fetching order details ${orderId}:`, error);
    throw error;
  }
};

/**
 * Cancel order
 * @param {number|string} orderId - Order ID
 * @returns {Promise<object>} Result of the operation
 */
export const cancelOrder = async (orderId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User must be authenticated to cancel order');

    const result = await orderApi.cancelOrder(user.userId, orderId);
    return result;
  } catch (error) {
    console.error(`Error canceling order ${orderId}:`, error);
    throw error;
  }
};

export default {
  createOrder,
  getOrders,
  getOrderDetails,
  cancelOrder,
};
