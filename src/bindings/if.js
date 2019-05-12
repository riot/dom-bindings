/**
 * Binding responsible for the `if` directive
 */
export const IfBinding = Object.seal({
  // dynamic binding properties
  node: null,
  evaluate: null,
  placeholder: null,
  template: '',

  // API methods
  mount(scope, parentScope) {
    swap(this.placeholder, this.node)
    return this.update(scope, parentScope)
  },
  update(scope, parentScope) {
    const value = !!this.evaluate(scope)
    const mustMount = !this.value && value
    const mustUnmount = this.value && !value

    switch (true) {
    case mustMount:
      swap(this.node, this.placeholder)
      if (this.template) {
        this.template = this.template.clone()
        this.template.mount(this.node, scope, parentScope)
      }
      break
    case mustUnmount:
      this.unmount(scope)
      swap(this.placeholder, this.node)
      break
    default:
      if (value) this.template.update(scope, parentScope)
    }

    this.value = value

    return this
  },
  unmount(scope, parentScope) {
    const { template } = this

    if (template) {
      template.unmount(scope, parentScope)
    }

    return this
  }
})

function swap(inNode, outNode) {
  const parent = outNode.parentNode
  parent.insertBefore(inNode, outNode)
  parent.removeChild(outNode)
}

export default function create(node, { evaluate, template }) {
  return {
    ...IfBinding,
    node,
    evaluate,
    placeholder: document.createTextNode(''),
    template: template.createDOM(node)
  }
}