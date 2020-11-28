
import {EVENT, TEXT} from '@riotjs/util/expression-types'
import expressions from './expressions'
import {getTextNode} from './expressions/text'

export const Expression = {
  // Static props
  // node: null,
  // value: null,

  // API methods
  /**
   * Mount the expression evaluating its initial value
   * @param   {*} scope - argument passed to the expression to evaluate its current values
   * @returns {Expression} self
   */
  mount(scope) {
    // hopefully a pure function
    this.value = this.evaluate(scope)

    // IO() DOM updates
    apply(this, this.value)

    return this
  },
  /**
   * Update the expression if its value changed
   * @param   {*} scope - argument passed to the expression to evaluate its current values
   * @returns {Expression} self
   */
  update(scope) {
    // pure function
    const value = this.evaluate(scope)

    if (this.value !== value) {
      // IO() DOM updates
      apply(this, value)
      this.value = value
    }

    return this
  },
  /**
   * Expression teardown method
   * @returns {Expression} self
   */
  unmount() {
    // unmount only the event handling expressions
    if (this.type === EVENT) apply(this, null)

    return this
  }
}

/**
 * IO() function to handle the DOM updates
 * @param {Expression} expression - expression object
 * @param {*} value - current expression value
 * @returns {undefined}
 */
function apply(expression, value) {
  return expressions[expression.type](expression.node, expression, value, expression.value)
}

export default function create(node, data) {
  return {
    ...Expression,
    ...data,
    node: data.type === TEXT ?
      getTextNode(node, data.childNodeIndex) :
      node
  }
}
