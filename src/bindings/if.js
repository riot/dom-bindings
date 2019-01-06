import evalOrFallback from '../util/eval-or-fallback'

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
  mount(scope) {
    swap(this.placeholder, this.node)
    return this.update(scope)
  },
  update(scope) {
    const value = !!evalOrFallback(() => this.evaluate(scope), false)
    const mustMount = !this.value && value
    const mustUnmount = this.value && !value

    switch (true) {
    case mustMount:
      swap(this.node, this.placeholder)
      if (this.template) {
        this.template = this.template.clone(this.node)
        this.template.mount(this.node, scope)
      }
      break
    case mustUnmount:
      swap(this.placeholder, this.node)
      this.unmount(scope)
      break
    default:
      if (value) this.template.update(scope)
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
    ...IfBinding,
    node,
    evaluate,
    placeholder: document.createTextNode(''),
    template
  }
}