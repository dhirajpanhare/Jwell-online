import { executeProcedure } from '../api/dynamicApi';

export const getOrders = async (filters = {}) => {
  const result = await executeProcedure('SP_OrderList', filters);
  return Array.isArray(result) ? result : [];
};

export const getOrderDetails = async (orderId) => {
  const result = await executeProcedure('SP_OrderDetails', { p_OrderId: orderId });
  return Array.isArray(result) ? result[0] : result;
};

export const updateOrderStatus = async (orderId, status) => {
  return await executeProcedure('SP_OrderStatusUpdate', {
    p_OrderId: orderId,
    p_Status: status,
  });
};

export const getOrderItems = async (orderId) => {
  const result = await executeProcedure('SP_OrderItems', { p_OrderId: orderId });
  return Array.isArray(result) ? result : [];
};

export default { getOrders, getOrderDetails, updateOrderStatus, getOrderItems };
