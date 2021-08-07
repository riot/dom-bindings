import {SIMPLE} from '@riotjs/util/binding-types'
import {TEXT} from '@riotjs/util/expression-types'
import bindings from './bindings'

/**
 * Text expressions in a template tag will get childNodeIndex value normalized
 * depending on the position of the <template> tag offset
 * @param   {Expression[]} expressions - riot expressions array
 * @param   {number} textExpressionsOffset - offset of the <template> tag
 * @returns {Expression[]} expressions containing the text expressions normalized
 */
function fixTextExpressionsOffset(expressions, textExpressionsOffset) {
  return expressions.map(e => e.type === TEXT ? {
    ...e,
    childNodeIndex: e.childNodeIndex + textExpressionsOffset
  } : e)
}

/**
 * Bind a new expression object to a DOM node
 * @param   {HTMLElement} root - DOM node where to bind the expression
 * @param   {TagBindingData} binding - binding data
 * @param   {number|null} templateTagOffset - if it's defined we need to fix the text expressions childNodeIndex offset
 * @returns {Binding} Binding object
 */
export default function create(root, binding, templateTagOffset) {
  const { selector, type, redundantAttribute, expressions } = binding
  // find the node to apply the bindings
  const node = selector ? root.querySelector(selector) : root

  // remove eventually additional attributes created only to select this node
  if (redundantAttribute) node.removeAttribute(redundantAttribute)
  const bindingExpressions = expressions || []

  // init the binding
  return (bindings[type] || bindings[SIMPLE])(
    node,
    {
      ...binding,
      expressions: templateTagOffset && !selector ?
        fixTextExpressionsOffset(bindingExpressions, templateTagOffset) :
        bindingExpressions
    }
  )
}
