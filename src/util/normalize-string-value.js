/**
 * Normalize the user value in order to render an empty string in case of falsy values
 * @param   {*} value - user input value
 * @returns {string} hopefully a string
 */
export default function normalizeStringValue(value) {
  return value == null ? '' : value
}
