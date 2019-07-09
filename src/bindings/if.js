/**
 * Binding responsible for the `if` directive
 */
export const IfBinding = Object.seal({
  // dynamic binding properties
  node: null,
  evaluate: null,
  parent: null,
  isTemplateTag: false,
  placeholder: null,
  template: null,

  // API methods
  mount(scope, parentScope) {
    this.parent.insertBefore(this.placeholder, this.node)
    this.parent.removeChild(this.node)

    return this.update(scope, parentScope)
  },
  update(scope, parentScope) {
    const value = !!this.evaluate(scope)
    const mustMount = !this.value && value
    const mustUnmount = this.value && !value

    switch (true) {
    case mustMount:
      this.parent.insertBefore(this.node, this.placeholder)

      this.template = this.template.clone()
      this.template.mount(this.node, scope, parentScope)

      break
    case mustUnmount:
      this.unmount(scope)
      break
    default:
      if (value) this.template.update(scope, parentScope)
    }

    this.value = value

    return this
  },
  unmount(scope, parentScope) {
    this.template.unmount(scope, parentScope, true)

    return this
  }
})

export default function create(node, { evaluate, template }) {
  return {
    ...IfBinding,
    node,
    evaluate,
    parent: node.parentNode,
    placeholder: document.createTextNode(''),
    template: template.createDOM(node)
  }
}
