import expressions from './expressions'

const Expression = Object.seal({
  init(node, expression) {
    return Object.assign(this, expression, {
      node
    })
  },
  mount(scope) {
    this.value = this.apply(scope)

    return this
  },
  update(scope) {
    const value = this.evaluate(scope)

    if (this.value !== value) this.value = this.apply(value)

    return this
  },
  unmount() {
    return this
  },
  apply(value) {
    return expressions[this.type](this.node, value)
  }
})

export default function create(dom, expression) {
  return Object.create(Expression).init(dom, expression)
}