import {evaluateAttributeExpressions} from '@riotjs/util/misc'
import {removeNode} from '@riotjs/util/dom'
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

export const SlotBinding = Object.seal({
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

    this.template = templateData && template(
      templateData.html,
      templateData.bindings
    ).createDOM(parentNode)

    if (this.template) {
      this.template.mount(this.node, this.getTemplateScope(scope, parentScope))
      this.template.children = moveSlotInnerContent(this.node)
    }

    removeNode(this.node)

    return this
  },
  update(scope, parentScope) {
    if (this.template) {
      this.template.update(this.getTemplateScope(scope, parentScope))
    }

    return this
  },
  unmount(scope, parentScope, mustRemoveRoot) {
    if (this.template) {
      this.template.unmount(this.getTemplateScope(scope, parentScope), null, mustRemoveRoot)
    }

    return this
  }
})

/**
 * Move the inner content of the slots outside of them
 * @param   {HTMLNode} slot - slot node
 * @param   {HTMLElement} children - array to fill with the child nodes detected
 * @returns {HTMLElement[]} list of the node moved
 */
function moveSlotInnerContent(slot, children = []) {
  const child = slot.firstChild
  if (child) {
    slot.parentNode.insertBefore(child, slot)
    return [child, ...moveSlotInnerContent(slot)]
  }

  return children
}

/**
 * Create a single slot binding
 * @param   {HTMLElement} node - slot node
 * @param   {string} options.name - slot id
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