export default function textExpression(node, expression, scope) {
  node.childNodes[expression.childNodeIndex].textContent = expression.value(scope)
}