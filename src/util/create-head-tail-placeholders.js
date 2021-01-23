import {HEAD_SYMBOL, TAIL_SYMBOL} from '../constants'


/**
 * Create the <template> fragments comment nodes
 * @return {Object} {{head: Comment, tail: Comment}}
 */
export default function createHeadTailPlaceholders() {
  const head = document.createComment('fragment head')
  const tail = document.createComment('fragment tail')

  head[HEAD_SYMBOL] = true
  tail[TAIL_SYMBOL] = true

  return {head, tail}
}
