/**
 * Binding object
 */
export default {
  init(node, expressions) {
    Object.assign(this, {
      nodePrototype: node.cloneNode(true),
      expressions,
      node,
    })

    return this
  },
  clone() {
    return this.init(
      this.nodePrototype.cloneNode(true),
      this.expressions
    )
  },
  unmount() {
    return this
  },
  update() {
    this.expessions.
    return this
  }
}