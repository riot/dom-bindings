import { HEAD_SYMBOL, TAIL_SYMBOL } from '../constants.js'

/**
 * Create the <template> fragments text nodes
 * @returns {object} {{head: Text, tail: Text}}
 */
export default function createHeadTailPlaceholders() {
  const head = document.createTextNode('')
  const tail = document.createTextNode('')

  head[HEAD_SYMBOL] = true
  tail[TAIL_SYMBOL] = true

  return { head, tail }
}
