import { executeProcedure } from '../api/dynamicApi';

/**
 * Fetch all products with optional filters
 * @param {object} filters - Filter options (category, minPrice, maxPrice, sortBy, search, etc.)
 * @returns {Promise<Array>} Array of products
 */
export const getProducts = async (filters = {}) => {
  try {
    const params = {
      ...(filters.category && { p_Category: filters.category }),
      ...(filters.minPrice && { p_MinPrice: filters.minPrice }),
      ...(filters.maxPrice && { p_MaxPrice: filters.maxPrice }),
      ...(filters.material && { p_Material: filters.material }),
      ...(filters.sortBy && { p_SortBy: filters.sortBy }),
      ...(filters.search && { p_Search: filters.search }),
      ...(filters.page && { p_Page: filters.page }),
      ...(filters.limit && { p_Limit: filters.limit }),
    };

    const result = await executeProcedure('SP_GetProducts', params);
    return Array.isArray(result) ? result : result?.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch product details by ID
 * @param {number|string} productId - Product ID
 * @returns {Promise<object>} Product details
 */
export const getProductById = async (productId) => {
  try {
    const result = await executeProcedure('SP_GetProductById', {
      p_ProductId: productId,
    });
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

/**
 * Fetch best selling products
 * @param {number} limit - Number of products to fetch (default: 6)
 * @returns {Promise<Array>} Array of best-selling products
 */
export const getBestSellers = async (limit = 6) => {
  try {
    const result = await executeProcedure('SP_GetBestSellers', {
      p_Limit: limit,
    });
    return Array.isArray(result) ? result : result?.data || [];
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    throw error;
  }
};

/**
 * Fetch product recommendations based on current product
 * @param {number|string} productId - Current product ID
 * @param {number} limit - Number of recommendations (default: 4)
 * @returns {Promise<Array>} Array of recommended products
 */
export const getRecommendations = async (productId, limit = 4) => {
  try {
    const result = await executeProcedure('SP_GetRecommendations', {
      p_ProductId: productId,
      p_Limit: limit,
    });
    return Array.isArray(result) ? result : result?.data || [];
  } catch (error) {
    console.error(`Error fetching recommendations for product ${productId}:`, error);
    throw error;
  }
};

export default {
  getProducts,
  getProductById,
  getBestSellers,
  getRecommendations,
};
