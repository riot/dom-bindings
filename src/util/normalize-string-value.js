import {isNil} from '@riotjs/util/checks'

/**
 * Normalize the user value in order to render a empty string in case of falsy values
 * @param   {*} value - user input value
 * @returns {string} hopefully a string
 */
export default function normalizeStringValue(value) {
  return isNil(value) ? '' : value
}