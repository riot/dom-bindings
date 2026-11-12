import { ATTRIBUTE } from '@riotjs/util/expression-types'
import template from '../template.js'

/**
 * Create a new tag object if it was registered before, otherwise fallback to the simple
 * template chunk
 * @param   {(data: object) => object} component - component factory function
 * @param   {Array<object>} slots - array containing the slots markup
 * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
 * @param   {Array} attributes - dynamic attributes that will be received by the tag element
 */
function getTag(component, slots = [], attributes = []) {
  // if this tag was registered before we will return its implementation
  if (component) {
    return component({ slots, attributes })
  }

  // otherwise we return a template chunk
  return template(slotsToMarkup(slots), [
    ...slotBindings(slots),
    {
      // the attributes should be registered as binding
      // if we fallback to a normal template chunk
      expressions: attributes.map((attr) => {
        return {
          type: ATTRIBUTE,
          ...attr,
        }
      }),
    },
  ])
}

/**
 * Merge all the slots bindings into a single array
 * @param   {Array<object>} slots - slots collection
 * @returns {Array<Bindings>} flatten bindings array
 */
function slotBindings(slots) {
  return slots.reduce((acc, { bindings }) => acc.concat(bindings), [])
}

/**
 * Merge all the slots together in a single markup string
 * @param   {Array<object>} slots - slots collection
 * @returns {string} markup of all the slots in a single string
 */
function slotsToMarkup(slots) {
  return slots.reduce((acc, slot) => {
    return acc + slot.html
  }, '')
}

export const TagBinding = {
  // dynamic binding properties
  // node: null,
  // evaluate: null,
  // name: null,
  // slots: null,
  // tag: null,
  // attributes: null,
  // getComponent: null,
  // componentFactory: null,

  mount(scope) {
    return this.update(scope)
  },
  update(scope, parentScope) {
    const name = this.evaluate(scope)
    // resolve the latest component factory available for this tag name
    const componentFactory = name ? this.getComponent(name) : undefined
    const mountComponent = () => {
      this.componentFactory = componentFactory
      this.tag = getTag(componentFactory, this.slots, this.attributes)
      this.tag.mount(this.node, scope)
    }

    // simple update
    if (name && name === this.name) {
      // the component implementation might have been replaced at runtime
      // (e.g. by the @riotjs/hot-reload package): in that case the tag must
      // be re-rendered using the latest component factory available
      if (componentFactory && componentFactory !== this.componentFactory) {
        // unmount the old tag keeping its root node in the DOM
        this.unmount(scope, parentScope, true)

        // remount the component using the new component factory
        mountComponent()
      } else {
        this.tag.update(scope)
      }
    } else {
      // unmount the old tag if it exists
      this.unmount(scope, parentScope, true)

      // mount the new tag
      this.name = name
      mountComponent()
    }

    return this
  },
  unmount(scope, parentScope, keepRootTag) {
    if (this.tag) {
      // keep the root tag
      this.tag.unmount(keepRootTag)
    }

    return this
  },
}

export default function create(
  node,
  { evaluate, getComponent, slots, attributes },
) {
  return {
    ...TagBinding,
    node,
    evaluate,
    slots,
    attributes,
    getComponent,
  }
}
