import { executeProcedure } from '../api/dynamicApi';

/**
 * Get dashboard summary data
 */
export const getDashboardSummary = async () => {
  try {
    const result = await executeProcedure('SP_DashboardSummary', {});
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

/**
 * Get revenue chart data
 */
export const getRevenueChart = async (timeRange = 'month') => {
  try {
    const result = await executeProcedure('SP_DashboardRevenueChart', {
      p_TimeRange: timeRange,
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching revenue chart:', error);
    throw error;
  }
};

/**
 * Get orders chart data
 */
export const getOrdersChart = async (timeRange = 'month') => {
  try {
    const result = await executeProcedure('SP_DashboardOrdersChart', {
      p_TimeRange: timeRange,
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching orders chart:', error);
    throw error;
  }
};

/**
 * Get top products
 */
export const getTopProducts = async (limit = 5) => {
  try {
    const result = await executeProcedure('SP_DashboardTopProducts', {
      p_Limit: limit,
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

/**
 * Get top categories
 */
export const getTopCategories = async (limit = 5) => {
  try {
    const result = await executeProcedure('SP_DashboardTopCategories', {
      p_Limit: limit,
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching top categories:', error);
    throw error;
  }
};

/**
 * Get recent orders
 */
export const getRecentOrders = async (limit = 10) => {
  try {
    const result = await executeProcedure('SP_DashboardRecentOrders', {
      p_Limit: limit,
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

export default {
  getDashboardSummary,
  getRevenueChart,
  getOrdersChart,
  getTopProducts,
  getTopCategories,
  getRecentOrders,
};
