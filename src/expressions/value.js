import normalizeStringValue from '../util/normalize-string-value.js'

/**
 * This method handles the input fields value updates
 * @param   {Object} expression - expression object
 * @param   {HTMLElement} expression.node - target node
 * @param   {*} expression.value - old expression value
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
export default function valueExpression({ node, value: oldValue }, value) {
  if (oldValue !== value) node.value = normalizeStringValue(value)
}
