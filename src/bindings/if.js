/**
 * Binding responsible for the `if` directive
 */
export const ifBinding = Object.seal({
  mount(scope) {
    swap(this.placeholder, this.node)
    return this.update(scope)
  },
  update(scope) {
    const value = this.evaluate(scope)
    const mustMount = !this.value && value
    const mustUnmount = this.value && !value
    const mustUpdate = value && this.template

    if (mustMount) {
      swap(this.node, this.placeholder)
      if (this.template) {
        this.template = this.template.clone()
        this.template.mount(this.node, scope)
      }
    } else if (mustUnmount) {
      swap(this.placeholder, this.node)
      this.unmount(scope)
    } else if (mustUpdate) {
      this.template.update(scope)
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
  return Object.assign({}, ifBinding, {
    node,
    evaluate,
    placeholder: document.createTextNode(''),
    template
  })
}