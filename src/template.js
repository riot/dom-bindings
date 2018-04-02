import createBinding from './binding'
import createFragment from './util/create-fragment'
import flattenCollectionMethods from './util/flatten-collection-methods'

/**
 * Template Chunk model
 * @type {Object}
 */
const TemplateChunk = Object.seal({
  init(html, bindings = []) {
    const dom = typeof html === 'string' ? createFragment(html).content : html
    const proto = dom.cloneNode(true)
    // create the bindings and batch them together
    const { mount, update, unmount } = flattenCollectionMethods(
      bindings.map(binding => createBinding(dom, binding)),
      ['mount', 'update', 'unmount'],
      this
    )

    return Object.assign(this, {
      mount,
      update,
      unmount,
      bindings,
      dom,
      proto
    })
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
export default function create(html, bindings) {
  return Object.create(TemplateChunk).init(html, bindings)
}