import {
  isBoolean as checkIfBoolean,
  isFunction,
  isObject,
  isNil,
  isEventAttribute,
} from '@riotjs/util/checks'
import { memoize } from '@riotjs/util/misc'
import refExpression from './ref.js'
import { VALUE_ATTRIBUTE, REF_ATTRIBUTE } from '@riotjs/util'
import valueExpression from './value.js'
import eventExpression from './event.js'

/* c8 ignore next */
const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype
const isNativeHtmlProperty = memoize(
  (name) => ElementProto.hasOwnProperty(name), // eslint-disable-line
)

/**
 * Add all the attributes provided
 * @param   {HTMLElement} node - target node
 * @param   {object} attributes - object containing the attributes names and values
 * @returns {undefined} sorry it's a void function :(
 */
function setAllAttributes(node, attributes) {
  Object.entries(attributes).forEach(([name, value]) => {
    switch (true) {
      case name === REF_ATTRIBUTE:
        return refExpression({ node }, value)
      case name === VALUE_ATTRIBUTE:
        return valueExpression({ node }, value)
      case isEventAttribute(name):
        return eventExpression({ node, name }, value)
      default:
        return attributeExpression({ node, name }, value)
    }
  })
}

/**
 * Remove all the attributes provided
 * @param   {HTMLElement} node - target node
 * @param   {object} newAttributes - object containing all the new attribute names
 * @param   {object} oldAttributes - object containing all the old attribute names
 * @returns {undefined} sorry it's a void function :(
 */
function removeAllAttributes(node, newAttributes, oldAttributes) {
  const newKeys = newAttributes ? Object.keys(newAttributes) : []

  Object.entries(oldAttributes)
    .filter(([name]) => !newKeys.includes(name))
    .forEach(([name, value]) => {
      switch (true) {
        case name === REF_ATTRIBUTE:
          return refExpression({ node, value })
        case name === VALUE_ATTRIBUTE:
          node.removeAttribute('value')
          node.value = ''
          return
        case isEventAttribute(name):
          return eventExpression({ node, name }, null)
        default:
          return node.removeAttribute(name)
      }
    })
}

/**
 * Check whether the attribute value can be rendered
 * @param {*} value - expression value
 * @returns {boolean} true if we can render this attribute value
 */
function canRenderAttribute(value) {
  return ['string', 'number', 'boolean'].includes(typeof value)
}

/**
 * Check whether the attribute should be removed
 * @param {*} value - expression value
 * @param   {boolean} isBoolean - flag to handle boolean attributes
 * @returns {boolean} boolean - true if the attribute can be removed
 */
function shouldRemoveAttribute(value, isBoolean) {
  // boolean attributes should be removed if the value is falsy
  if (isBoolean) return !value

  // null and undefined values will remove the attribute as well
  return isNil(value)
}

/**
 * This methods handles the DOM attributes updates
 * @param   {object} expression - attribute expression data
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

  // store the attribute on the node to make it compatible with native custom elements
  if (
    !isNativeHtmlProperty(name) &&
    (checkIfBoolean(value) || isObject(value) || isFunction(value))
  ) {
    node[name] = value
  }

  if (shouldRemoveAttribute(value, isBoolean)) {
    node.removeAttribute(name)
  } else if (canRenderAttribute(value)) {
    node.setAttribute(name, normalizeValue(name, value, isBoolean))
  }
}

/**
 * Get the value as string
 * @param   {string} name - attribute name
 * @param   {*} value - user input value
 * @param   {boolean} isBoolean - boolean attributes flag
 * @returns {string} input value as string
 */
function normalizeValue(name, value, isBoolean) {
  // be sure that expressions like selected={ true } will always be rendered as selected='selected'
  // fix https://github.com/riot/riot/issues/2975
  return !!value && isBoolean ? name : value
}
