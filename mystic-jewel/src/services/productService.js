import { productApi } from '../api/dynamicApiService';

// Helper: safely extract array from varied API response shapes
const toArray = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (result?.data && typeof result.data === 'object') return [result.data];
  return [];
};

const toSingle = (result) => {
  if (Array.isArray(result)) return result[0] || null;
  if (Array.isArray(result?.data)) return result.data[0] || null;
  if (result?.data && typeof result.data === 'object') return result.data;
  return result || null;
};

export const getProducts = async (filters = {}) => {
  try {
    const result = await productApi.getProducts(filters);
    return toArray(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (productId) => {
  try {
    const result = await productApi.getProductById(productId);
    return toSingle(result);
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

export const getBestSellers = async (limit = 6) => {
  try {
    const result = await productApi.getBestSellers(limit);
    return toArray(result);
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    return [];
  }
};

export const getRecommendations = async (productId, limit = 4) => {
  try {
    const result = await productApi.getRecommendations(productId, limit);
    return toArray(result);
  } catch (error) {
    console.error(`Error fetching recommendations for ${productId}:`, error);
    return [];
  }
};

export default { getProducts, getProductById, getBestSellers, getRecommendations };
