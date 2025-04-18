import { cleanNode, insertBefore, removeChild } from '@riotjs/util/dom'
import { PARENT_KEY_SYMBOL } from '@riotjs/util/constants'
import { evaluateAttributeExpressions } from '@riotjs/util/misc'
import template from '../template.js'

const extendParentScope = (attributes, scope, parentScope) => {
  if (!attributes || !attributes.length) return parentScope

  const expressions = attributes.map((attr) => ({
    ...attr,
    value: attr.evaluate(scope),
  }))

  return Object.assign(
    Object.create(parentScope || null),
    evaluateAttributeExpressions(expressions),
  )
}

const findSlotById = (id, slots) => slots?.find((slot) => slot.id === id)

// this function is only meant to fix an edge case
// https://github.com/riot/riot/issues/2842
const getRealParent = (scope, parentScope) =>
  scope[PARENT_KEY_SYMBOL] || parentScope

export const SlotBinding = {
  // dynamic binding properties
  // node: null,
  // name: null,
  attributes: [],
  // templateData: null,
  // template: null,

  getTemplateScope(scope, parentScope) {
    return extendParentScope(this.attributes, scope, parentScope)
  },

  // API methods
  mount(scope, parentScope) {
    const templateData = scope.slots
      ? findSlotById(this.name, scope.slots)
      : false
    const { parentNode } = this.node

    // if the slot did not pass any content, we will use the self slot for optional fallback content (https://github.com/riot/riot/issues/3024)
    const realParent = templateData ? getRealParent(scope, parentScope) : scope

    // if there is no html for the current slot detected we rely on the parent slots (https://github.com/riot/riot/issues/3055)
    this.templateData = templateData?.html
      ? templateData
      : findSlotById(this.name, realParent.slots)

    // override the template property if the slot needs to be replaced
    this.template =
      (this.templateData &&
        template(this.templateData.html, this.templateData.bindings).createDOM(
          parentNode,
        )) ||
      // otherwise use the optional template fallback if provided by the compiler see also https://github.com/riot/riot/issues/3014
      this.template?.clone()

    if (this.template) {
      cleanNode(this.node)
      this.template.mount(
        this.node,
        this.getTemplateScope(scope, realParent),
        realParent,
      )
      this.template.children = Array.from(this.node.childNodes)
    }

    moveSlotInnerContent(this.node)
    removeChild(this.node)

    return this
  },
  update(scope, parentScope) {
    if (this.template) {
      const realParent = this.templateData
        ? getRealParent(scope, parentScope)
        : scope

      this.template.update(this.getTemplateScope(scope, realParent), realParent)
    }

    return this
  },
  unmount(scope, parentScope, mustRemoveRoot) {
    if (this.template) {
      this.template.unmount(
        this.getTemplateScope(scope, parentScope),
        null,
        mustRemoveRoot,
      )
    }

    return this
  },
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
export default function createSlot(node, { name, attributes, template }) {
  return {
    ...SlotBinding,
    attributes,
    template,
    node,
    name,
  }
}
