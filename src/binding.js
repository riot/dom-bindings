import curry from 'curri'
import bind from './bind'

/**
 * Expression object
 */
export default {
  init(node, data, ...args) {
    Object.assign(this, {
      nodePrototype: node.cloneNode(true),
      expressions: data.map(expression => bind(node, expression, ...args)),
      data,
      node
    })

    // add the update and unmount methods
    this.update = curry(exec)(this.expressions, 'update')
    this.unmount = curry(exec)(this.expressions, 'unmount')

    return this
  },
  clone() {
    return this.init(
      this.nodePrototype.cloneNode(true),
      this.data
    )
  }
}

/**
 * Execute a single method on all the expressions list
 * @param   { Array } expressions - list of expressions
 * @param   { String } method - expression method to execute
 * @param   {...*} args - expression method caller arguments
 * @returns { Array }
 */
function exec(expressions, method, ...args) {
  return expressions.map(expression => expression[method](...args))
}