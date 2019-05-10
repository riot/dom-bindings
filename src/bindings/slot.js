import template from '../template'

export const SlotBinding = Object.seal({
  // dynamic binding properties
  node: null,
  name: null,
  template: null,

  // API methods
  mount(scope) {
    const templateData = scope.slots ? scope.slots.find(({id}) => id === this.name) : false
    const {parentNode} = this.node

    this.template = templateData && template(
      templateData.html,
      templateData.bindings
    ).createDOM(parentNode)

    if (this.template) {
      this.template.mount(this.node, scope)
      moveSlotInnerContent(this.node)
    }

    parentNode.removeChild(this.node)

    return this
  },
  update(scope) {
    if (this.template) {
      this.template.update(scope)
    }

    return this
  },
  unmount(scope) {
    if (this.template) {
      this.template.unmount(scope)
    }

    return this
  }
})

/**
 * Move the inner content of the slots outside of them
 * @param   {HTMLNode} slot - slot node
 * @returns {undefined} it's a void function
 */
function moveSlotInnerContent(slot) {
  if (slot.firstChild) {
    slot.parentNode.insertBefore(slot.firstChild, slot)
    moveSlotInnerContent(slot)
  }
}

/**
 * Create a single slot binding
 * @param   {HTMLElement} node - slot node
 * @param   {string} options.name - slot id
 * @returns {Object} Slot binding object
 */
export default function createSlot(node, { name }) {
  return {
    ...SlotBinding,
    node,
    name
  }
}