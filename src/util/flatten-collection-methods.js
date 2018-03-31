/**
 * Create a flat object having as keys a list of methods that if dispatched will propagate
 * on the whole collection
 * @param   { Array } collection - collection to iterate
 * @param   { Array<String> } methods - methods to execute on each item of the collection
 * @param   { * } context - context returned by the new methods created
 * @returns { Object } a new object to simplify the the nested methods dispatching
 */
export default function flattenCollectionMethods(collection, methods, context) {
  return methods.reduce((acc, method) => {
    return Object.assign(acc, {
      [method]: (...args) => {
        collection.forEach(item => item[method](...args))
        return context
      }
    })
  }, {})
}