import normalizeStringValue from '../util/normalize-string-value.js'

/**
 * Get the the target text node to update or create one from of a comment node
 * @param   {HTMLElement} node - any html element containing childNodes
 * @param   {number} childNodeIndex - index of the text node in the childNodes list
 * @returns {Text} the text node to update
 */
export const getTextNode = (node, childNodeIndex) => {
  return node.childNodes[childNodeIndex]
}

/**
 * This methods handles a simple text expression update
 * @param   {HTMLElement} node - target node
 * @param   {Object} data - expression object
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
export default function textExpression(node, data, value) {
  node.data = normalizeStringValue(value)
}
