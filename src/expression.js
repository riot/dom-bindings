import { EVENT, TEXT } from '@riotjs/util/expression-types'
import expressions from './expressions/index.js'
import { getTextNode } from './expressions/text.js'
import { REF_ATTRIBUTE } from './constants.js'

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
    return this.update(scope)
  },

  /**
   * Update the expression
   * @param   {*} scope - argument passed to the expression to evaluate its current values
   * @returns {Expression} self
   */
  update(scope) {
    // pure function
    const value = this.evaluate(scope)

    // ref attributes should be called only once during mount
    if (this.name === REF_ATTRIBUTE && !this.value) {
      value(this.node)
      this.value = value
      return this
    }

    // IO() DOM updates
    apply(this, value)
    this.value = value

    return this
  },

  /**
   * Expression teardown method
   * @returns {Expression} self
   */
  unmount() {
    // unmount only the event handling expressions
    if (this.type === EVENT) apply(this, null)
    // ref attributes need to be called with null reference
    if (this.name === REF_ATTRIBUTE) this.value(null)

    return this
  },
}

/**
 * IO() function to handle the DOM updates
 * @param {Expression} expression - expression object
 * @param {*} newValue - current expression value
 * @returns {undefined}
 */
function apply(expression, newValue) {
  return expressions[expression.type](expression, newValue)
}

export default function create(node, data) {
  return {
    ...Expression,
    ...data,
    node: data.type === TEXT ? getTextNode(node, data.childNodeIndex) : node,
  }
}
