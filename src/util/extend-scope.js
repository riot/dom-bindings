/**
 * Extend the props of a scope template object without actually overriding its original keys
 * @param  {Object} source - original scope
 * @param  {Object} object - object containing the new keys
 * @return {Object} a new scope object
 */
export default function extendScope(source, object) {
  // eslint-disable-next-line fp/no-proxy
  return new Proxy(source, {
    get(target, prop) {
      return prop in object ? object[prop] : target[prop]
    },
  })
}
