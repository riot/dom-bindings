import createExpression from '../expression'
import flattenCollectionMethods from '../util/flatten-collection-methods'

export default function create(node, { expressions }) {
  return {
    ...flattenCollectionMethods(
      expressions.map(expression => createExpression(node, expression)),
      ['mount', 'update', 'unmount']
    )
  }
}
