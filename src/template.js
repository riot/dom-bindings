import createBinding from './binding'
import createFragment from './util/create-fragment'
import cleanNode from './util/clean-node'

/**
 * Template Chunk model
 * @type {Object}
 */
const TemplateChunk = Object.seal({
  init(dom, bindings) {
    const proto = dom.cloneNode(true)

    return Object.assign(this, {
      bindings: bindings.map(binding => createBinding(dom, binding)),
      dom,
      proto
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
    el.appendChild(this.dom)
    this.bindings.forEach(({ mount }) => mount(scope))

    return this
  },
  /**
   * Update the template with fresh data
   * @param   { * } scope - template data
   * @returns { TemplateChunk } self
   */
  update(scope) {
    this.bindings.forEach(({ update }) => update(scope))

    return this
  },
  /**
   * Remove the template from the node where it was initially mounted
   * @param   { * } scope - template data
   * @returns { TemplateChunk } self
   */
  unmount(scope) {
    if (!this.el) throw new Error('This template was never mounted before')

    this.bindings.forEach(({ unmount }) => unmount(scope))
    cleanNode(this.el)
    this.el = null

    return this
  },
  /**
   * Clone the template chunk
   * @returns { TemplateChunk } a new template chunk
   */
  clone() {
    return create(this.proto.cloneNode(true), this.bindings)
  }
})

/**
 * Create a template chunk wiring also the bindings
 * @param   { String } html - template string
 * @param   { Array } bindings - bindings collection
 * @returns { TemplateChunk } a new TemplateChunk copy
 */
export default function create(html, bindings = []) {
  if (!html) throw new Error('The html element is required, please provide a string or a DOM node')
  const dom = typeof html === 'string' ? createFragment(html).content : html
  return Object.create(TemplateChunk).init(dom, bindings)
}