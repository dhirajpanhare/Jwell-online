import { executeProcedure } from '../api/dynamicApi';
import { getAuthToken } from '../api/authApi';

/**
 * Create a new order
 * @param {object} orderData - Order details
 * @returns {Promise<object>} Created order information
 */
export const createOrder = async (orderData) => {
  try {
    if (!getAuthToken()) {
      throw new Error('User must be authenticated to create order');
    }

    const result = await executeProcedure('SP_CreateOrder', {
      p_ShippingAddress: orderData.shippingAddress,
      p_ShippingCity: orderData.shippingCity,
      p_ShippingState: orderData.shippingState,
      p_ShippingZipCode: orderData.shippingZipCode,
      p_PaymentMethod: orderData.paymentMethod,
      p_Notes: orderData.notes || '',
    });
    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get user's orders
 * @param {object} filters - Filter options (status, startDate, endDate, etc.)
 * @returns {Promise<Array>} Array of orders
 */
export const getOrders = async (filters = {}) => {
  try {
    if (!getAuthToken()) {
      throw new Error('User must be authenticated to view orders');
    }

    const params = {
      ...(filters.status && { p_Status: filters.status }),
      ...(filters.startDate && { p_StartDate: filters.startDate }),
      ...(filters.endDate && { p_EndDate: filters.endDate }),
      ...(filters.page && { p_Page: filters.page }),
      ...(filters.limit && { p_Limit: filters.limit }),
    };

    const result = await executeProcedure('SP_GetOrders', params);
    return Array.isArray(result) ? result : result?.data || [];
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
    if (!getAuthToken()) {
      throw new Error('User must be authenticated to view order details');
    }

    const result = await executeProcedure('SP_GetOrderDetails', {
      p_OrderId: orderId,
    });
    return Array.isArray(result) ? result[0] : result;
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
    if (!getAuthToken()) {
      throw new Error('User must be authenticated to cancel order');
    }

    const result = await executeProcedure('SP_CancelOrder', {
      p_OrderId: orderId,
    });
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
