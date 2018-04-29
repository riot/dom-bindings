/* WIP */
export const eachBinding = Object.seal({
  mount(scope) {
    return this.update(scope)
  },
  /* eslint-disable */
  update(scope) {
    const value = this.evaulate(scope)
    const parent = this.placeholder.parentNode
    const fragment = document.createDocumentFragment()

    // [...] @TODO: implement list updates

    this.value = value
    this.expressionsBatch.update()

    return this
  },
  unmount() {
    this.expressionsBatch.unmount()
    return this
  }
})

/* eslint-disable */
function extendScope(key, value, scope) {
  return Object.assign({}, {
    [key]: value
  }, scope)
}
/* eslint-enable */

export default function create(node, { evaluate, template, expressions }) {
  const placeholder = document.createTextNode('')
  const parent = node.parentNode

  parent.insertBefore(placeholder, node)
  parent.removeChild(node)

  return Object.assign({}, eachBinding, {
    node,
    evaluate,
    template,
    expressions,
    placeholder
  })
}