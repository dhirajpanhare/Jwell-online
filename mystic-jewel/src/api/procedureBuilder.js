/**
 * Converts parameter object to Dynamic API payload format
 * Example:
 *   buildProcedurePayload('SP_GetProductDetails', {
 *     p_ProductId: 1,
 *     p_CategoryId: 2
 *   })
 *   Returns:
 *   {
 *     stringOne: "p_ProductId=1|p_CategoryId=2",
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
  const paramString = Object.entries(params)
    .map(([key, value]) => `${key}${keyValueSeparator}${value}`)
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
  Object.entries(params).forEach(([key, value]) => {
    query.append(key, value);
  });
  return query.toString();
};

export default buildProcedurePayload;
