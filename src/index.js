import Binding from './binding'

/**
 * Mathod that can be used recursively bind expressions to a DOM tree structure
 * @param   { HTMLElement } root - the root node where to start applying the bindings
 * @param   { Array } bindings - list of the expressions to bind
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
 * ])
 */
export function create(root, bindings) {
  return bindings.map(binding => {
    return upgrade(root, binding)
  })
}

/**
 * Upgrade a DOM node to a dom+expressions
 * @param   { String } options.selector - selector used to select the target of our expressions
 * @param   { String } options.redundantAttribute - attribute we want to remove (eventually used as selector)
 */
export function upgrade(root, { selector, redundantAttribute, expressions }) {
  // find the node to apply the bindings
  const node = root.querySelector(selector)
  if (!node) throw new Error(`It was not possible to find any DOM node with the selector '${selector}' to bind your expressions`)
  // remove eventually additional attributes created only to select this node
  if (redundantAttribute) node.removeAttribute(redundantAttribute)
  // create a new Binding instance
  return Object.assign({}, Binding).init(root, expressions)
}