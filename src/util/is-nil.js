/**
 * Check if a value is null or undefined
 * @param   {*}  value - anything
 * @returns {boolean} true only for the 'undefined' and 'null' types
 */
export default function isNil(value) {
  return value === null || value === undefined
}