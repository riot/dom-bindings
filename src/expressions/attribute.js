import {
  isBoolean as checkIfBoolean,
  isFunction,
  isObject,
} from '@riotjs/util/checks'
import { memoize } from '@riotjs/util/misc'

/* c8 ignore next */
const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype
const isNativeHtmlProperty = memoize(
  (name) => ElementProto.hasOwnProperty(name), // eslint-disable-line
)

/**
 * Check whether the attribute value can be rendered
 * @param {HTMLElement} node - target node
 * @param {*} value - expression value
 * @returns {boolean} true if we can render this attribute value
 */
const shouldSetAttribute = (node, value) => {
  return (
    ['string', 'number', 'boolean'].includes(typeof value) &&
    node.getAttribute(name) !== String(value)
  )
}

/**
 * Check whether the attribute should be removed
 * @param {*} value - expression value
 * @param   {boolean} isBoolean - flag to handle boolean attributes
 * @returns {boolean} boolean - true if the attribute can be removed
 */
const shouldRemoveAttribute = (value, isBoolean) =>
  isBoolean ? !value && value !== 0 : value == null

/**
 * Get the value as string
 * @param   {string} name - attribute name
 * @param   {*} value - user input value
 * @param   {boolean} isBoolean - boolean attributes flag
 * @returns {string} input value as string
 */
const normalizeValue = (name, value, isBoolean) =>
  // be sure that expressions like selected={ true } will always be rendered as selected='selected'
  // fix https://github.com/riot/riot/issues/2975
  value === true && isBoolean ? name : value

/**
 * Handle the spread operator {...attributes}
 * @param   {HTMLElement} node - target node
 * @param   {Object} value - new expression value
 * @param   {Object} oldValue - the old expression cached value
 * @returns {undefined}
 */
function handleSpreadAttributes(node, value, oldValue) {
  const newKeys = Object.keys(value || [])

  // remove all the old attributes not present in the new values
  if (oldValue) {
    Object.keys(oldValue)
      .filter((name) => !newKeys.includes(name))
      .forEach((attribute) => node.removeAttribute(attribute))
  }

  newKeys.forEach((name) => attributeExpression({ node, name }, value[name]))
}

/**
 * This method handles the DOM attributes updates
 * @param   {Object} expression - expression object
 * @param   {HTMLElement} expression.node - target node
 * @param   {string} expression.name - attribute name
 * @param   {boolean} expression.isBoolean - flag to handle boolean attributes
 * @param   {*} expression.value - the old expression cached value
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
export default function attributeExpression(
  { node, name, isBoolean, value: oldValue },
  value,
) {
  // Spread operator {...attributes}
  if (!name) {
    handleSpreadAttributes(node, value, oldValue)
    return
  }

  // store the attribute on the node to make it compatible with native custom elements
  if (
    !isNativeHtmlProperty(name) &&
    (checkIfBoolean(value) || isObject(value) || isFunction(value))
  ) {
    node[name] = value
  }

  // remove any attributes with null values or falsy boolean native properties
  if (shouldRemoveAttribute(value, isBoolean)) {
    node.removeAttribute(name)
  }
  // set new attributes if necessary
  else if (shouldSetAttribute(node, value)) {
    node.setAttribute(name, normalizeValue(name, value, isBoolean))
  }
}
