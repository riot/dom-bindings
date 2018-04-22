export default function attributeExpression(node, { name }, value, oldValue) {
  if (!name) {
    if (value)
      Object.entries(value).forEach(([key, value]) => attributeExpression(node, { name: key }, value))
    else if (oldValue)
      Object.keys(oldValue).forEach(key => attributeExpression(node, { name: key }))
  } else {
    node[value ? 'setAttribute' : 'removeAttribute'](name, Array.isArray(value) ? value.join(' ') : value)
  }
}