import normalizeStringValue from '../util/normalize-string-value.js'
/**
 * This methods handles the input fields value updates
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
export default function valueExpression(node, expression, value) {
  node.value = normalizeStringValue(value)
}
