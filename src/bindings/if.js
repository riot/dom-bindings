import cleanNode from '../util/clean-node'

export default Object.seal({
  init(node, { evaluate, template, expressions }) {
    return Object.assign(this, {
      node,
      expressions,
      evaluate,
      placeholder: document.createTextNode(''),
      template
    })
  },
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
        this.template.mount(scope)
        this.node.appendChild(this.template.dom)
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
      cleanNode(this.node)
    }
    return this
  }
})

function swap(inNode, outNode) {
  const parent = outNode.parentNode
  parent.insertBefore(inNode, outNode)
  parent.removeChild(outNode)
}