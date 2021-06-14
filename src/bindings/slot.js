import {cleanNode, insertBefore, removeChild} from '@riotjs/util/dom'
import {PARENT_KEY_SYMBOL} from '@riotjs/util/constants'
import {evaluateAttributeExpressions} from '@riotjs/util/misc'
import template from '../template'

function extendParentScope(attributes, scope, parentScope) {
  if (!attributes || !attributes.length) return parentScope

  const expressions = attributes.map(attr => ({
    ...attr,
    value: attr.evaluate(scope)
  }))

  return Object.assign(
    Object.create(parentScope || null),
    evaluateAttributeExpressions(expressions)
  )
}

// this function is only meant to fix an edge case
// https://github.com/riot/riot/issues/2842
const getRealParent = (scope, parentScope) => scope[PARENT_KEY_SYMBOL] || parentScope

export const SlotBinding = {
  // dynamic binding properties
  // node: null,
  // name: null,
  attributes: [],
  // template: null,

  getTemplateScope(scope, parentScope) {
    return extendParentScope(this.attributes, scope, parentScope)
  },

  // API methods
  mount(scope, parentScope) {
    const templateData = scope.slots ? scope.slots.find(({id}) => id === this.name) : false
    const {parentNode} = this.node
    const realParent = getRealParent(scope, parentScope)

    this.template = templateData && template(
      templateData.html,
      templateData.bindings
    ).createDOM(parentNode)

    if (this.template) {
      cleanNode(this.node)
      this.template.mount(this.node, this.getTemplateScope(scope, realParent), realParent)
      this.template.children = Array.from(this.node.childNodes)
    }

    moveSlotInnerContent(this.node)
    removeChild(this.node)

    return this
  },
  update(scope, parentScope) {
    if (this.template) {
      const realParent = getRealParent(scope, parentScope)
      this.template.update(this.getTemplateScope(scope, realParent), realParent)
    }

    return this
  },
  unmount(scope, parentScope, mustRemoveRoot) {
    if (this.template) {
      this.template.unmount(this.getTemplateScope(scope, parentScope), null, mustRemoveRoot)
    }

    return this
  }
}

/**
 * Move the inner content of the slots outside of them
 * @param   {HTMLElement} slot - slot node
 * @returns {undefined} it's a void method ¯\_(ツ)_/¯
 */
function moveSlotInnerContent(slot) {
  const child = slot && slot.firstChild

  if (!child) return

  insertBefore(child, slot)
  moveSlotInnerContent(slot)
}

/**
 * Create a single slot binding
 * @param   {HTMLElement} node - slot node
 * @param   {string} name - slot id
 * @param   {AttributeExpressionData[]} attributes - slot attributes
 * @returns {Object} Slot binding object
 */
export default function createSlot(node, { name, attributes }) {
  return {
    ...SlotBinding,
    attributes,
    node,
    name
  }
}
