import cleanNode from './util/clean-node'
import createBinding from './binding'
import createFragment from './util/create-fragment'

/**
 * Template Chunk model
 * @type {Object}
 */
export const TemplateChunk = Object.freeze({
  // Static props
  bindings: null,
  bindingsData: null,
  dom: null,
  el: null,

  // API methods
  /**
   * Attatch the template to a DOM node
   * @param   {HTMLElement} el - target DOM node
   * @param   {*} scope - template data
   * @returns {TemplateChunk} self
   */
  mount(el, scope) {
    if (!el) throw new Error('Please provide DOM node to mount properly your template')

    if (this.el) this.unmount(scope)

    this.el = el

    // clone the template DOM and append it to the target node
    if (this.dom) el.appendChild(this.dom.cloneNode(true))

    // create the bindings
    this.bindings = this.bindingsData.map(binding => createBinding(this.el, binding))
    this.bindings.forEach(b => b.mount(scope))

    return this
  },
  /**
   * Update the template with fresh data
   * @param   {*} scope - template data
   * @returns {TemplateChunk} self
   */
  update(scope) {
    this.bindings.forEach(b => b.update(scope))

    return this
  },
  /**
   * Remove the template from the node where it was initially mounted
   * @param   {*} scope - template data
   * @param   {boolean} mustRemoveRoot - if true remove the root element
   * @returns {TemplateChunk} self
   */
  unmount(scope, mustRemoveRoot) {
    if (this.el) {
      this.bindings.forEach(b => b.unmount(scope))
      cleanNode(this.el)

      if (mustRemoveRoot) {
        this.el.parentNode.removeChild(this.el)
      }

      this.el = null
    }

    return this
  },
  /**
   * Clone the template chunk
   * @returns {TemplateChunk} a new template chunk
   */
  clone() {
    return create(this.dom, this.bindingsData)
  }
})

/**
 * Create a template chunk wiring also the bindings
 * @param   {string|HTMLElement} html - template string
 * @param   {Array} bindings - bindings collection
 * @returns {TemplateChunk} a new TemplateChunk copy
 */
export default function create(html, bindings = []) {
  const dom = typeof html === 'string' ? createFragment(html).content : html

  return {
    ...TemplateChunk,
    dom,
    bindingsData: bindings
  }
}