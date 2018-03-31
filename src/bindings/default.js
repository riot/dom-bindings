import flattenCollectionMethods from '../util/flatten-collection-methods'
import createExpression from '../expression'

export default Object.seal({
  init(node, { expressions }) {
    return Object.assign(this, flattenCollectionMethods(
      expressions.map(expression => createExpression(node, expression)),
      ['mount', 'update', 'unmount'],
      this
    ))
  }
})