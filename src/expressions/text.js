/**
 * This methods handles a simple text expression update
 * @param   {HTMLElement} node - target node
 * @param   {object} expression - expression object
 * @param   {number} expression.childNodeIndex - index to find the text node to update
 * @param   {*} value - new expression value
 */
export default function textExpression(node, { childNodeIndex }, value) {
  const target = node.childNodes[childNodeIndex]

  // replace the target if it's a placeholder comment
  if (target.nodeType === Node.COMMENT_NODE) {
    const textNode = document.createTextNode(value)
    node.replaceChild(textNode, target)
  } else {
    target.textContent = value
  }
}