export default {
  mount(node, expression, ...args) {
    Object.assign(this, { node, expression })
    return this.update(...args)
  },
  update(...args) {
    this.node.value = this.expression.value(...args)

    return this
  },
  unmount() {
    return this
  }
}