export default Object.seal({
  mount(node, expression, ...args) {
    return Object.assign({}, this, { node, expression }).update(...args)
  },
  update(...args) {
    this.node.textContent = this.expression.value(...args)

    return this
  },
  unmount() {
    return this
  }
})