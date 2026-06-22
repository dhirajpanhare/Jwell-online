import axiosInstance from './axiosInstance';
import { buildProcedurePayload } from './payloadBuilder';

/**
 * Execute a stored procedure through the Dynamic API.
 * The axiosInstance automatically attaches adminAuthToken and
 * redirects to /admin/login on 401/403.
 */
export const executeProcedure = async (procedureName, params = {}) => {
  try {
    const payload = buildProcedurePayload(procedureName, params);

    const response = await axiosInstance.post(
      import.meta.env.VITE_DYNAMIC_API_ENDPOINT,
      payload
    );

    // API returned a non-success response body
    if (response.data?.status === false) {
      throw new Error(response.data?.message || `Procedure ${procedureName} failed`);
    }

    return response.data?.data ?? response.data;
  } catch (error) {
    // Re-throw with a cleaner message; axios interceptor handles 401/403 redirect
    const message = error.response?.data?.message || error.message || `Error calling ${procedureName}`;
    throw new Error(message);
  }
};

/**
 * Batch execute multiple procedures in parallel
 */
export const executeBatchProcedures = async (procedures) => {
  const promises = procedures.map(({ procedureName, params }) =>
    executeProcedure(procedureName, params)
  );
  return Promise.all(promises);
};

export default executeProcedure;
