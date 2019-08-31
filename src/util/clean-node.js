/**
 * Remove the child nodes from any DOM node
 * @param   {HTMLElement} node - target node
 * @returns {undefined}
 */
export default function cleanNode(node) {
  clearChildren(node.childNodes)
}

/**
 * Clear multiple children in a node
 * @param   {HTMLElement[]} children - direct children nodes
 * @returns {undefined}
 */
export function clearChildren(children) {
  Array.from(children).forEach(n => n.parentNode && n.parentNode.removeChild(n))
}