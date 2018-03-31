export default function attributeExpression(node, expression, value) {
  node[value ? 'setAttribute' : 'removeAttribute'](expression.name, value)
}