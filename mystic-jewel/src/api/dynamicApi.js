import axiosInstance from './axiosInstance';
import { buildProcedurePayload } from './procedureBuilder';

/**
 * Executes a stored procedure through the Dynamic API
 * @param {string} procedureName - Name of the stored procedure (e.g., 'SP_GetProducts')
 * @param {object} params - Parameters for the stored procedure (e.g., { p_ProductId: 1 })
 * @param {string} paramSeparator - Separator between parameters (default: '|')
 * @param {string} keyValueSeparator - Separator between key and value (default: '=')
 * @returns {Promise<object>} Response data from the API
 */
export const executeProcedure = async (
  procedureName,
  params = {},
  paramSeparator = '|',
  keyValueSeparator = '='
) => {
  try {
    const payload = buildProcedurePayload(
      procedureName,
      params,
      paramSeparator,
      keyValueSeparator
    );

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
 * @param {Array<{procedureName, params}>} procedures - Array of procedures to execute
 * @returns {Promise<Array>} Array of results
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
