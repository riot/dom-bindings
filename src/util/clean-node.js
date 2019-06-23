/**
 * Remove the child nodes from any DOM node
 * @param   {HTMLElement} node - target node
 * @returns {undefined}
 */
export default function cleanNode(node) {
  clearChildren(node, node.childNodes)
}

/**
 * Clear multiple children in a node
 * @param   {HTMLElement} parent - parent node where the children will be removed
 * @param   {HTMLElement[]} children - direct children nodes
 * @returns {undefined}
 */
export function clearChildren(parent, children) {
  Array.from(children).forEach(n => parent.removeChild(n))
}