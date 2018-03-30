import { create as bind } from './binding'

/**
 * Mathod that can be used recursively bind expressions to a DOM tree structure
 * @param   { HTMLElement } root - the root node where to start applying the bindings
 * @param   { Array } bindings - list of the expressions to bind
 * @param   { * } args - context needed to evaluate the expressions
 * @returns { Array } bindings objects upgraded to a Binding object
 *
 * @example
 * riotDOMBindings.create(DOMtree, [{
 *     selector: '[expr0]',
 *     redundantAttribute: 'expr0',
 *     expressions: [
 *       { type: 'text', value(scope) { return scope.name }}
 *     ]
 *   }
 * ], { name: 'hi' })
 */
export function create(root, bindings, ...args) {
  return bindings.map(binding => {
    return upgrade(root, binding, ...args)
  })
}

/**
 * Upgrade a DOM node to a dom+expressions
 * @param   { String } options.selector - selector used to select the target of our expressions
 * @param   { String } options.redundantAttribute - attribute we want to remove (eventually used as selector)
 */
export function upgrade(root, { selector, redundantAttribute, expressions }, ...args) {
  // find the node to apply the bindings
  const node = selector ? root.querySelector(selector) : node
  // remove eventually additional attributes created only to select this node
  if (redundantAttribute) node.removeAttribute(redundantAttribute)
  // create a new Binding object
  return bind(root, expressions, ...args)
}

export { create as chunk } from './template'