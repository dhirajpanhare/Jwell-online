import { categoryApi } from '../api/dynamicApiService';

const toArray = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
};

export const getCategories = async () => {
  try {
    const result = await categoryApi.getCategories();
    return toArray(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const result = await categoryApi.getCategoryById(categoryId);
    const arr = toArray(result);
    return arr[0] || null;
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    return null;
  }
};

export default { getCategories, getCategoryById };
