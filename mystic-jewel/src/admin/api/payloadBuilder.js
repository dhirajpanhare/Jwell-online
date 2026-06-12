/**
 * Converts parameter object to Dynamic API payload format
 */
export const buildProcedurePayload = (
  procedureName,
  params = {},
  paramSeparator = '|',
  keyValueSeparator = '='
) => {
  // Build parameter string from params object
  const paramString = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}${keyValueSeparator}${String(value).replace(/\|/g, '')}`)
    .join(paramSeparator);

  return {
    stringOne: paramString,
    stringTwo: paramSeparator,
    stringThree: keyValueSeparator,
    stringFour: procedureName,
  };
};

export default buildProcedurePayload;
