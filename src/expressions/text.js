import {isNil} from '@riotjs/util/checks'

/**
 * Get the the target text node to update or create one from of a comment node
 * @param   {HTMLElement} node - any html element containing childNodes
 * @param   {number} childNodeIndex - index of the text node in the childNodes list
 * @returns {HTMLTextNode} the text node to update
 */
export const getTextNode = (node, childNodeIndex) => {
  const target = node.childNodes[childNodeIndex]

  if (target.nodeType === Node.COMMENT_NODE) {
    const textNode = document.createTextNode('')
    node.replaceChild(textNode, target)

    return textNode
  }

  return target
}

/**
 * This methods handles a simple text expression update
 * @param   {HTMLElement} node - target node
 * @param   {Object} data - expression object
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
export default function textExpression(node, data, value) {
  node.data = normalizeValue(value)
}

/**
 * Normalize the user value in order to render a empty string in case of falsy values
 * @param   {*} value - user input value
 * @returns {string} hopefully a string
 */
function normalizeValue(value) {
  return isNil(value) ? '' : value
}