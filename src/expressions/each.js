export default {
  mount(node, expression, ...args) {
    const parent = node.parentNode
    const placeholder = document.createTextNode('')

    Object.assign(this, {
      node,
      expression,
      placeholder
    })

    parent.insertBefore(placeholder, node)
    parent.removeChild(node)

    return this.update(...args)
  },
  update(...args) {
    const value = this.expression.value(...args)
    const parent = this.placeholder.parentNode
    const fragment = document.createDocumentFragment()

    // [...] @TODO: implement list updates

    this.value = value

    return this
  },
  unmount() {
    return this
  }
}