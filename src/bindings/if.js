/**
 * Binding responsible for the `if` directive
 */
export const ifBinding = Object.seal({
  // dynamic binding properties
  node: null,
  evaluate: null,
  placeholder: null,
  template: '',

  // API methods
  mount(scope) {
    swap(this.placeholder, this.node)
    return this.update(scope)
  },
  update(scope) {
    const value = this.evaluate(scope)
    const mustMount = !this.value && value
    const mustUnmount = this.value && !value

    switch (true) {
    case mustMount:
      swap(this.node, this.placeholder)
      if (this.template) {
        this.template = this.template.clone()
        this.template.mount(this.node, scope)
      }
      break
    case mustUnmount:
      swap(this.placeholder, this.node)
      this.template = null
      this.unmount(scope)
      break
    default:
      this.template.update(scope)
      break
    }

    this.value = value

    return this
  },
  unmount(scope) {
    const { template } = this

    if (template) {
      template.unmount(scope)
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
    ...ifBinding,
    node,
    evaluate,
    placeholder: document.createTextNode(''),
    template
  }
}