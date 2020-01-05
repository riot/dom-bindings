import {isBoolean, isFunction, isNil, isObject} from '@riotjs/util/checks'
import {memoize} from '@riotjs/util/misc'

const REMOVE_ATTRIBUTE = 'removeAttribute'
const SET_ATTIBUTE = 'setAttribute'
const ElementProto = Element.prototype

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
 * @param   {Object} attributes - object containing all the attribute names
 * @returns {undefined} sorry it's a void function :(
 */
function removeAllAttributes(node, attributes) {
  Object
    .keys(attributes)
    .forEach(attribute => node.removeAttribute(attribute))
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
    // is the value still truthy?
    if (value) {
      setAllAttributes(node, value)
    } else if (oldValue) {
      // otherwise remove all the old attributes
      removeAllAttributes(node, oldValue)
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

  node[getMethod(value)](name, normalizeValue(name, value))
}

/**
 * Get the attribute modifier method
 * @param   {*} value - if truthy we return `setAttribute` othewise `removeAttribute`
 * @returns {string} the node attribute modifier method name
 */
function getMethod(value) {
  return isNil(value) ||
    value === false ||
    value === '' ||
    isObject(value) ||
    isFunction(value) ?
    REMOVE_ATTRIBUTE :
    SET_ATTIBUTE
}

/**
 * Get the value as string
 * @param   {string} name - attribute name
 * @param   {*} value - user input value
 * @returns {string} input value as string
 */
function normalizeValue(name, value) {
  // be sure that expressions like selected={ true } will be always rendered as selected='selected'
  if (value === true) return name

  return value
}