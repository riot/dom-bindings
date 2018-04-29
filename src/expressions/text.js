/**
 * This methods handles a simple text expression update
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {number} expression.childNodeIndex - index to find the text node to update
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
export default function textExpression(node, { childNodeIndex }, value) {
  const target = node.childNodes[childNodeIndex]
  const val = normalizeValue(value)

  // replace the target if it's a placeholder comment
  if (target.nodeType === Node.COMMENT_NODE) {
    const textNode = document.createTextNode(val)
    node.replaceChild(textNode, target)
  } else {
    target.textContent = normalizeValue(val)
  }
}

/**
 * Normalize the user value in order to render a empty string in case of falsy values
 * @param   {*} value - user input value
 * @returns {string} hopefully a string
 */
function normalizeValue(value) {
  return value || ''
}