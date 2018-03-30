/**
 * Template Chunk model
 * @type {Object}
 */
export const TemplateChunk = Object.seal({
  mount(html, bindings) {
    const dom = this.dom || createTemplate(html).content

    return Object.assign({}, this, {
      bindings: this.bindings || bindings,
      dom,
      proto: dom.cloneNode(true)
    })
  },
  update(...args) {
    this.bindings.update(...args)

    return this
  },
  unmount(...args) {
    this.bindings.unmount(...args)

    return this
  },
  clone() {
    const dom = this.proto.cloneNode(true)

    return Object.assign({}, this, {
      bindings: this.bindings.clone(dom),
      dom
    })
  }
})

/**
 * Create a template chunk wiring also the bindings
 * @param   { String } html - template string
 * @param   { Array } bindings - bindings collection
 * @returns { TemplateChunk } a new TemplateChunk copy
 */
export function create(html, bindings) {
  return Object.assign({}, TemplateChunk).init(html, bindings)
}

/**
 * Create a template node
 * @param   { String } html - template inner html
 * @returns { HTMLElement } the new template node just created
 */
export function createTemplate(html) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template
}