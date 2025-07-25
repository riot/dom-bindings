import { EVENT, TEXT, REF, ATTRIBUTE } from '@riotjs/util/expression-types'
import expressions from './expressions/index.js'
import { getTextNode } from './expressions/text.js'

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
    const value = this.evaluate(scope)

    // IO() DOM updates
    expressions[this.type](this, value)

    // store the computed value for the update calls
    this.value = value

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
      expressions[this.type](this, value)
      this.value = value
    }

    return this
  },
  /**
   * Expression teardown method
   * @returns {Expression} self
   */
  unmount() {
    // unmount event and ref expressions
    if (
      [EVENT, REF].includes(this.type) ||
      // spread attributes might contain events or refs that must be unmounted
      (this.type === ATTRIBUTE && !this.name)
    )
      expressions[this.type](this, null)

    return this
  },
}

export default function create(node, data) {
  return {
    ...Expression,
    ...data,
    node: data.type === TEXT ? getTextNode(node, data.childNodeIndex) : node,
  }
}
