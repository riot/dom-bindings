/**
 * Check if a value is a Boolean
 * @param   {*}  value - anything
 * @returns {boolean} true only for the value is a boolean
 */
export default function isBoolean(value) {
  return typeof value === 'boolean'
}