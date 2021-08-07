import {HEAD_SYMBOL, TAIL_SYMBOL} from '../constants'


/**
 * Create the <template> fragments text nodes
 * @return {Object} {{head: Text, tail: Text}}
 */
export default function createHeadTailPlaceholders() {
  const head = document.createTextNode('')
  const tail = document.createTextNode('')

  head[HEAD_SYMBOL] = true
  tail[TAIL_SYMBOL] = true

  return {head, tail}
}
