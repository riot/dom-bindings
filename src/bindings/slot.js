import template from '../template'

/**
 * Binding responsible for the slots mounting
 */
export const SlotBinding = Object.seal({
  // dynamic binding properties
  node: null,
  name: null,
  template: null,

  // API methods
  mount(scope) {
    const { slots } = scope
    const targetSlot = slots && slots.find(s => s.id === this.name)
    if (targetSlot) {
      this.template = this.template ?
        this.template.clone() :
        template(targetSlot.html, targetSlot.bindings).createDOM(this.node.parentNode)

      this.template.mount(this.node, scope)
    } else {
      this.node.parentNode.removeChild(this.node)
    }

    return this
  },
  update(scope) {
    if (!this.template) return this
    this.template.update(scope)

    return this
  },
  unmount(scope) {
    if (!this.template) return this
    this.template.unmount(scope)

    return this
  }
})

export default function create(node, { name }) {
  return {
    ...SlotBinding,
    node,
    name
  }
}