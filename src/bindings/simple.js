import flattenCollectionMethods from '../util/flatten-collection-methods'
import createExpression from '../expression'

export default function create(node, { expressions }) {
  return Object.assign({}, flattenCollectionMethods(
    expressions.map(expression => createExpression(node, expression)),
    ['mount', 'update', 'unmount']
  ))
}
