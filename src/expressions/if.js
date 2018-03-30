export default Object.seal({
  mount(node, expression, ...args) {
    return Object.assign({}, this, {
      node,
      expression,
      placeholder: document.createTextNode('')
    }).update(...args)
  },
  update(...args) {
    const { chunk } = this.expression
    const value = this.expression.value(...args)
    const mustMount = this.value && !value
    const mustUnmount = !this.value && value
    const mustUpdate = value && chunk

    if (mustMount) {
      swap(this.node, this.placeholder)
      if (chunk)
        chunk.clone().mount(...args)
    } else if (mustUnmount) {
      swap(this.placeholder, this.node)
      this.unmount(...args)
    } else if (mustUpdate) {
      chunk.update(...args)
    }

    this.value = value

    return this
  },
  unmount(...args) {
    const { chunk } = this.expression
    if (chunk) chunk.unmount(...args)
    return this
  }
})

function swap(inNode, outNode) {
  const parent = outNode.parentNode
  parent.insertBefore(inNode, outNode)
  parent.removeChild(outNode)
}