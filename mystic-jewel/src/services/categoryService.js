import { executeProcedure } from '../api/dynamicApi';

/**
 * Fetch all product categories
 * @returns {Promise<Array>} Array of categories
 */
export const getCategories = async () => {
  try {
    const result = await executeProcedure('SP_GetCategories', {});
    return Array.isArray(result) ? result : result?.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Fetch category by ID
 * @param {number|string} categoryId - Category ID
 * @returns {Promise<object>} Category details
 */
export const getCategoryById = async (categoryId) => {
  try {
    const result = await executeProcedure('SP_GetCategoryById', {
      p_CategoryId: categoryId,
    });
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    throw error;
  }
};

export default {
  getCategories,
  getCategoryById,
};
