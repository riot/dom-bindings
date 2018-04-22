import expressions from './expressions'

const Expression = Object.seal({
  init(node, expression) {
    return Object.assign(this, expression, {
      node
    })
  },
  mount(scope) {
    this.value = this.evaluate(scope)
    this.apply(this.value)

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
    return expressions[this.type](this.node, this, value, this.value)
  }
})

export default function create(dom, expression) {
  return Object.create(Expression).init(dom, expression)
}