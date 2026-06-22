/**
 * Converts parameter object to Dynamic API payload format
 * Example:
 *   buildProcedurePayload('SP_GetProductDetails', {
 *     p_ProductId: 1,
 *     p_CategoryId: 2,
 *     p_Name: null  // Will be filtered out
 *   })
 *   Returns:
 *   {
 *     stringOne: "p_ProductId=1|p_CategoryId=2",  // Note: null values excluded
 *     stringTwo: "|",
 *     stringThree: "=",
 *     stringFour: "SP_GetProductDetails"
 *   }
 */
export const buildProcedurePayload = (
  procedureName,
  params = {},
  paramSeparator = '|',
  keyValueSeparator = '='
) => {
  // Build parameter string from params object
  // Only include non-null and non-undefined values
  const paramString = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)  // Filter out null/undefined
    .map(([key, value]) => {
      // Handle different data types properly
      let paramValue = value;
      
      if (typeof value === 'boolean') {
        paramValue = value ? 1 : 0;  // Convert boolean to 1/0 for MySQL
      } else if (typeof value === 'number') {
        paramValue = value;  // Numbers as-is
      } else if (typeof value === 'string') {
        // Escape quotes in strings
        paramValue = value.replace(/"/g, '\\"');
      } else {
        paramValue = String(value);
      }
      
      return `${key}${keyValueSeparator}${paramValue}`;
    })
    .join(paramSeparator);

  return {
    stringOne: paramString,
    stringTwo: paramSeparator,
    stringThree: keyValueSeparator,
    stringFour: procedureName,
  };
};

/**
 * Converts the parameter object to URL search params format
 * Used for GET requests if needed
 */
export const buildQueryParams = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)  // Filter out null/undefined
    .forEach(([key, value]) => {
      query.append(key, value);
    });
  return query.toString();
};

export default buildProcedurePayload;
