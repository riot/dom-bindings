import {isSvg, isTemplate} from '@riotjs/util/checks'

// in this case a simple innerHTML is enough
function createHTMLTree(html, root) {
  const template = isTemplate(root) ? root : document.createElement('template')
  template.innerHTML = html
  return template.content
}

// for svg nodes we need a bit more work
function createSVGTree(html, container) {
  // create the SVGNode
  const svgNode = container.ownerDocument.importNode(
    new window.DOMParser()
      .parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`,
        'application/xml'
      )
      .documentElement,
    true
  )

  return svgNode
}

/**
 * Create the DOM that will be injected
 * @param {Object} root - DOM node to find out the context where the fragment will be created
 * @param   {string} html - DOM to create as string
 * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
 */
export default function createDOMTree(root, html) {
  if (isSvg(root)) return createSVGTree(html, root)

  return createHTMLTree(html, root)
}

