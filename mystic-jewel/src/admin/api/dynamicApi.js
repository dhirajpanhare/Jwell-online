import axiosInstance from './axiosInstance';
import { buildProcedurePayload } from './payloadBuilder';

/**
 * Execute a stored procedure through the Dynamic API
 * @param {string} procedureName - Name of stored procedure (e.g., 'SP_ProductList')
 * @param {object} params - Parameters for the procedure
 * @returns {Promise<any>} Response data from API
 */
export const executeProcedure = async (procedureName, params = {}) => {
  try {
    const payload = buildProcedurePayload(procedureName, params);

    const response = await axiosInstance.post(
      import.meta.env.VITE_DYNAMIC_API_ENDPOINT,
      payload
    );

    // Handle response format
    if (response.data?.status === true) {
      return response.data.data || response.data;
    }

    throw new Error(response.data?.message || 'API request failed');
  } catch (error) {
    console.error(`Error executing procedure ${procedureName}:`, error);
    throw error;
  }
};

/**
 * Batch execute multiple procedures
 */
export const executeBatchProcedures = async (procedures) => {
  try {
    const promises = procedures.map(({ procedureName, params }) =>
      executeProcedure(procedureName, params)
    );
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error executing batch procedures:', error);
    throw error;
  }
};

export default executeProcedure;
