/**
 * Remove the child nodes from any DOM node
 * @param   { HTMLElement } node - target node
 */
export default function cleanNode(node) {
  const children = node.childNodes

  while (children.length) {
    node.removeChild(children[0])
  }
}