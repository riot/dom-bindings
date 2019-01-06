import moveChildren from './move-children'

const SVG_RE = /svg/i

/**
 * Inject the DOM tree into a target node
 * @param   {HTMLElement} el - target element
 * @param   {HTMLFragment|SVGElement} dom - dom tree to inject
 * @returns {undefined}
 */
export default function injectDOM(el, dom) {
  if (SVG_RE.test(el.tagName)) {
    moveChildren(dom, el)
  } else {
    el.appendChild(dom)
  }
}