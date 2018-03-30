export default Object.seal({
  mount(node, expression, ...args) {
    const placeholder = document.createTextNode('')
    const parent = node.parentNode

    parent.insertBefore(placeholder, node)
    parent.removeChild(node)

    return Object.assign({}, this, {
      node,
      expression,
      placeholder
    }).update(...args)
  },
  update(...args) {
    /* eslint-disable */
    const value = this.expression.value(...args)
    const parent = this.placeholder.parentNode
    const fragment = document.createDocumentFragment()

    // [...] @TODO: implement list updates

    this.value = value
    /* eslint-enable */
    return this
  },
  unmount() {
    return this
  }
})