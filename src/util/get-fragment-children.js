import {HEAD_SYMBOL, TAIL_SYMBOL} from '../constants'

/**
 * Get the current <template> fragment children located in between the head and tail comments
 * @param {Comment} head - head comment node
 * @param {Comment} tail - tail comment node
 * @return {Array[]} children list of the nodes found in this template fragment
 */
export default function getFragmentChildren({ head, tail }) {
  const nodes = walkNodes([head], head.nextSibling, n => n === tail, false)
  nodes.push(tail)

  return nodes
}

/**
 * Recursive function to walk all the <template> children nodes
 * @param {Array[]} children - children nodes collection
 * @param {ChildNode} node - current node
 * @param {Function} check - exit function check
 * @param {boolean} isFilterActive - filter flag to skip nodes managed by other bindings
 * @returns {Array[]} children list of the nodes found in this template fragment
 */
function walkNodes(children, node, check, isFilterActive) {
  const {nextSibling} = node

  // filter tail and head nodes together with all the nodes in between
  // this is needed only to fix a really ugly edge case https://github.com/riot/riot/issues/2892
  if (!isFilterActive && !node[HEAD_SYMBOL] && !node[TAIL_SYMBOL]) {
    children.push(node)
  }

  if (!nextSibling || check(node)) return children

  return walkNodes(
    children,
    nextSibling,
    check,
    // activate the filters to skip nodes between <template> fragments that will be managed by other bindings
    isFilterActive && !node[TAIL_SYMBOL] || nextSibling[HEAD_SYMBOL]
  )
}
