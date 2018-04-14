export default function textExpression(node, expression, value) {
  const target = node.childNodes[expression.childNodeIndex]

  // replace the target if it's a comment
  if (target.nodeType === Node.COMMENT_NODE) {
    const textNode = document.createTextNode(value)
    node.replaceChild(textNode, target)
  } else {
    target.textContent = value
  }
}