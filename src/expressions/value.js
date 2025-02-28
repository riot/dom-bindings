import normalizeStringValue from '../util/normalize-string-value.js'
/**
 * This methods handles the input fields value updates
 * @param   {HTMLElement} expression.node - target node
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
export default function valueExpression({ node }, value) {
  node.value = normalizeStringValue(value)
}
