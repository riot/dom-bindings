import {isBoolean, isFunction, isObject} from '@riotjs/util/checks'
import {memoize} from '@riotjs/util/misc'

const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype
const isNativeHtmlProperty = memoize(name => ElementProto.hasOwnProperty(name) ) // eslint-disable-line

/**
 * Add all the attributes provided
 * @param   {HTMLElement} node - target node
 * @param   {Object} attributes - object containing the attributes names and values
 * @returns {undefined} sorry it's a void function :(
 */
function setAllAttributes(node, attributes) {
  Object
    .entries(attributes)
    .forEach(([name, value]) => attributeExpression(node, { name }, value))
}

/**
 * Remove all the attributes provided
 * @param   {HTMLElement} node - target node
 * @param   {Object} newAttributes - object containing all the new attribute names
 * @param   {Object} oldAttributes - object containing all the old attribute names
 * @returns {undefined} sorry it's a void function :(
 */
function removeAllAttributes(node, newAttributes, oldAttributes) {
  const newKeys = newAttributes ? Object.keys(newAttributes) : []

  Object
    .keys(oldAttributes)
    .filter(name => !newKeys.includes(name))
    .forEach(attribute => node.removeAttribute(attribute))
}

/**
 * Check whether the attribute value can be rendered
 * @param {*} value - expression value
 * @returns {boolean} true if we can render this attribute value
 */
function canRenderAttribute(value) {
  return value === true || ['string', 'number'].includes(typeof value)
}

/**
 * Check whether the attribute should be removed
 * @param {*} value - expression value
 * @returns {boolean} boolean - true if the attribute can be removed}
 */
function shouldRemoveAttribute(value) {
  return !value && value !== 0
}

/**
 * This methods handles the DOM attributes updates
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - attribute name
 * @param   {*} value - new expression value
 * @param   {*} oldValue - the old expression cached value
 * @returns {undefined}
 */
export default function attributeExpression(node, { name }, value, oldValue) {
  // is it a spread operator? {...attributes}
  if (!name) {
    if (oldValue) {
      // remove all the old attributes
      removeAllAttributes(node, value, oldValue)
    }

    // is the value still truthy?
    if (value) {
      setAllAttributes(node, value)
    }

    return
  }

  // handle boolean attributes
  if (
    !isNativeHtmlProperty(name) && (
      isBoolean(value) ||
      isObject(value) ||
      isFunction(value)
    )
  ) {
    node[name] = value
  }

  if (shouldRemoveAttribute(value)) {
    node.removeAttribute(name)
  } else if (canRenderAttribute(value)) {
    node.setAttribute(name, normalizeValue(name, value))
  }
}

/**
 * Get the value as string
 * @param   {string} name - attribute name
 * @param   {*} value - user input value
 * @returns {string} input value as string
 */
function normalizeValue(name, value) {
  // be sure that expressions like selected={ true } will be always rendered as selected='selected'
  return (value === true) ? name : value
}
