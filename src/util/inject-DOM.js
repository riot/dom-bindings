import moveChildren from './move-children'

/**
 * Inject the DOM tree into a target node
 * @param   {HTMLElement} el - target element
 * @param   {HTMLFragment|SVGElement} dom - dom tree to inject
 * @returns {undefined}
 */
export default function injectDOM(el, dom) {
  const clone = dom.cloneNode(true)

  if (el.tagName === 'SVG') {
    moveChildren(clone, el)
  } else {
    el.appendChild(clone)
  }
}