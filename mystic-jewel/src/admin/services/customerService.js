import { executeProcedure } from '../api/dynamicApi';

export const getCustomers = async (filters = {}) => {
  return await executeProcedure('SP_CustomerList', filters);
};

export const getCustomerDetails = async (customerId) => {
  const result = await executeProcedure('SP_CustomerDetails', { p_CustomerId: customerId });
  return Array.isArray(result) ? result[0] : result;
};

export const getCustomerOrders = async (customerId) => {
  return await executeProcedure('SP_CustomerOrders', { p_CustomerId: customerId });
};

export const updateCustomer = async (customerId, data) => {
  return await executeProcedure('SP_CustomerUpdate', {
    p_CustomerId: customerId,
    p_Email: data.email,
    p_Phone: data.phone,
    p_Status: data.status,
  });
};

export default { getCustomers, getCustomerDetails, getCustomerOrders, updateCustomer };
