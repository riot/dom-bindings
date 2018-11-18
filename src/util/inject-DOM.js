import moveChildren from './move-children'

const SVG_RE = /svg/i

/**
 * Inject the DOM tree into a target node
 * @param   {HTMLElement} el - target element
 * @param   {HTMLFragment|SVGElement} dom - dom tree to inject
 * @returns {undefined}
 */
export default function injectDOM(el, dom) {
  const clone = dom.cloneNode(true)

  if (SVG_RE.test(el.tagName)) {
    moveChildren(clone, el)
  } else {
    el.appendChild(clone)
  }
}