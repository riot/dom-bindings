import registry from './expressions'
import { create as createChunk, createTemplate } from './template'

/**
 * Binding object
 */
export const Binding = Object.seal({
  init(node, data, ...args) {
    return Object.assign({}, this, {
      expressions: bind(node, data, ...args),
      data,
      node
    })
  },
  update(...args) {
    this.expressions.forEach(({ update }) => update(...args))
    return this
  },
  unmount(...args) {
    this.expressions.forEach(({ unmount }) => unmount(...args))
    return this
  },
  clone(node) {
    return this.init(node, this.data)
  }
})

/**
 * Bind a new expression object to a DOM node
 * @param   { HTMLElement } node - DOM node where to bind the expression
 * @param   { Array } expressions - expressions array
 * @param   { ...* } args - values needed to evaluate the expressions
 * @returns { Expression } Expression object
 */
function bind(node, expressions, ...args) {
  return expressions.map(expression => {
    const { template, bindings } = expression

    if (template && bindings) {
      if (expression.chunk) {
        expression.chunk = expression.chunk.clone()
      } else {
        const dom = createTemplate(template)
        expression.chunk = createChunk(dom, create(dom.content, bindings, ...args))
      }
    }

    return Object.assign({}, registry[expression.type]).mount(node, expression, ...args)
  })
}

export function create(root, expressions, ...args) {
  return Object.assign({}, Binding).init(root, expressions, ...args)
}