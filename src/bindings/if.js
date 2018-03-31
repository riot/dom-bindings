export default Object.seal({
  init(node, { evaluate, template, expressions }) {
    const placeholder = document.createTextNode('')
    swap(placeholder, node)

    return Object.assign(this, {
      node,
      expressions,
      evaluate,
      placeholder,
      template
    })
  },
  mount(scope) {
    return this.update(scope)
  },
  update(scope) {
    const value = this.evaluate(scope)
    const mustMount = this.value && !value
    const mustUnmount = !this.value && value
    const mustUpdate = value && this.template

    if (mustMount) {
      swap(this.node, this.placeholder)
      if (this.template) {
        this.template = this.template.clone()
        this.template.mount(scope)
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
    if (template) template.unmount(scope)
    return this
  }
})

function swap(inNode, outNode) {
  const parent = outNode.parentNode
  parent.insertBefore(inNode, outNode)
  parent.removeChild(outNode)
}