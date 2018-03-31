export default function attributeExpression(node, expression, scope) {
  const value = expression.value(scope)
  node[value ? 'setAttribute' : 'removeAttribute'](expression.name, value)
}