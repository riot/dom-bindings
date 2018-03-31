export default function valueExpression(node, expression, scope) {
  node.value = expression.value(scope)
}