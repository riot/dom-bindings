export default function textExpression(node, expression, value) {
  node.childNodes[expression.childNodeIndex].textContent = value
}