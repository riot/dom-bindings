import expressions from './expressions'

const Expression = Object.seal({
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

export default function create(node, expression) {
  return Object.assign({}, Expression, expression, {
    node
  })
}