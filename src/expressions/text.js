export default {
  update(root, expression, ...args) {
    root.textContent = expression.value(...args)
    return this
  },
  unmount() {
    return this
  }
}