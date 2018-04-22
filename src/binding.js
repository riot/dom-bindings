import bindings from './bindings'

/**
 * Bind a new expression object to a DOM node
 * @param   { HTMLElement } root - DOM node where to bind the expression
 * @param   { Object } binding - binding data
 * @returns { Expression } Expression object
 */
export default function create(root, binding) {
  const { selector, type, redundantAttribute, expressions } = binding
  // find the node to apply the bindings
  const node = selector ? root.querySelector(selector) : root
  // remove eventually additional attributes created only to select this node
  if (redundantAttribute)
    node.removeAttribute(redundantAttribute)

  // init the binding
  return Object.create(bindings[type] || bindings.simple).init(
    node,
    Object.assign({}, binding, {
      expressions: expressions || []
    })
  )
}
