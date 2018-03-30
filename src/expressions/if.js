export default {
  mount(node, expression, ...args) {
    Object.assign(this, {
      node,
      expression,
      placeholder: document.createTextNode('')
    })

    return this.update(...args)
  },
  update(...args) {
    const value = this.expression.value(...args)
    const { bindings } = this.expression
    const mustMount = this.value && !value
    const mustUnmount = !this.value && value

    if (mustMount) {
      swap(this.node, this.placeholder)
      if (bindings) bindings.clone()
    } else if (mustUnmount) {
      swap(this.placeholder, this.node)
      this.unmount(...args)
    }

    if (value && bindings) bindings.update(...args)

    this.value = value

    return this
  },
  unmount(...args) {
    const { bindings } = this.expression
    if (bindings) bindings.unmount(...args)
    return this
  }
}

function swap(inNode, outNode) {
  const parent = outNode.parentNode
  parent.insertBefore(inNode, outNode)
  parent.removeChild(outNode)
}