import createBinding from './binding'
import createFragment from './util/create-fragment'
import cleanNode from './util/clean-node'

/**
 * Template Chunk model
 * @type {Object}
 */
const TemplateChunk = Object.seal({
  init(dom, bindings, attach) {
    return Object.assign(this, {
      dom,
      bindingsData: bindings,
      attach
    })
  },
  /**
   * Attatch the template to a DOM node
   * @param   { HTMLElement } el - target DOM node
   * @param   { * } scope - template data
   * @returns { TemplateChunk } self
   */
  mount(el, scope) {
    if (!el) throw new Error('Please provide DOM node to mount properly your template')

    if (this.el) this.unmount(scope)

    this.el = el

    const root = this.attach()

    // create the bindings
    this.bindings = this.bindingsData.map(binding => createBinding(root, binding)),
    this.bindings.forEach(b => b.mount(scope))

    return this
  },
  /**
   * Update the template with fresh data
   * @param   { * } scope - template data
   * @returns { TemplateChunk } self
   */
  update(scope) {
    this.bindings.forEach(b => b.update(scope))

    return this
  },
  /**
   * Remove the template from the node where it was initially mounted
   * @param   { * } scope - template data
   * @returns { TemplateChunk } self
   */
  unmount(scope) {
    if (!this.el) throw new Error('This template was never mounted before')

    this.bindings.forEach(b => b.unmount(scope))
    cleanNode(this.el)

    // todo: Can we detatch this.el.shadowRoot?

    this.el = null

    return this
  },
  /**
   * Clone the template chunk
   * @returns { TemplateChunk } a new template chunk
   */
  clone() {
    return create(this.dom, this.bindingsData, { attach: this.attatch })
  }
})

/**
 * Hosting strategy on light DOM
 */
function attachDOM() {
  // clone the template DOM and append it to the target node
  this.el.appendChild(this.dom.cloneNode(true))
  return this.el
}

/**
 * Hosting strategy on shadow DOM
 */
const attachShadowDOM = 'attachShadow' in Element.prototype ?
  function attachShadowDOM() {
    // clone the template DOM and append it to shadowRoot of the target node
    const shadowRoot = this.el.attachShadow({ mode: 'open' })
    shadowRoot.appendChild(this.dom.cloneNode(true))
    return shadowRoot.host
  }:
  function attachShadowDOM() {
    throw new Error('Shadow DOM is unavailable on your browser')
  }

/**
 * Create a template chunk wiring also the bindings
 * @param   { String } html - template string
 * @param   { Array } bindings - bindings collection
 * @param   { Object= } options - options
 * @param   { String= } options.attatch - host on Shadow DOM if 'shadow', host on DOM otherwise 
 * @returns { TemplateChunk } a new TemplateChunk copy
 */
export default function create(html, bindings = [], options = {}) {
  if (!html) throw new Error('The html element is required, please provide a string or a DOM node')
  const dom = typeof html === 'string' ? createFragment(html).content : html
  const attach = options.attach === undefined ? attachDOM : options.attach === 'shadow' ? attachShadowDOM : options.attach
  return Object.create(TemplateChunk).init(dom, bindings, attach)
}