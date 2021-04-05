import {ATTRIBUTE} from '@riotjs/util/expression-types'
import template from '../template'

/**
 * Create a new tag object if it was registered before, otherwise fallback to the simple
 * template chunk
 * @param   {Function} component - component factory function
 * @param   {Array<Object>} slots - array containing the slots markup
 * @param   {Array} attributes - dynamic attributes that will be received by the tag element
 * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
 */
function getTag(component, slots = [], attributes = []) {
  // if this tag was registered before we will return its implementation
  if (component) {
    return component({slots, attributes})
  }

  // otherwise we return a template chunk
  return template(slotsToMarkup(slots), [
    ...slotBindings(slots), {
      // the attributes should be registered as binding
      // if we fallback to a normal template chunk
      expressions: attributes.map(attr => {
        return {
          type: ATTRIBUTE,
          ...attr
        }
      })
    }
  ])
}


/**
 * Merge all the slots bindings into a single array
 * @param   {Array<Object>} slots - slots collection
 * @returns {Array<Bindings>} flatten bindings array
 */
function slotBindings(slots) {
  return slots.reduce((acc, {bindings}) => acc.concat(bindings), [])
}

/**
 * Merge all the slots together in a single markup string
 * @param   {Array<Object>} slots - slots collection
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

  mount(scope) {
    return this.update(scope)
  },
  update(scope, parentScope) {
    const name = this.evaluate(scope)

    // simple update
    if (name && name === this.name) {
      this.tag.update(scope)
    } else {
      // unmount the old tag if it exists
      this.unmount(scope, parentScope, true)

      // mount the new tag
      this.name = name
      this.tag = getTag(this.getComponent(name), this.slots, this.attributes)
      this.tag.mount(this.node, scope)
    }

    return this
  },
  unmount(scope, parentScope, keepRootTag) {
    if (this.tag) {
      // keep the root tag
      this.tag.unmount(keepRootTag)
    }

    return this
  }
}

export default function create(node, {evaluate, getComponent, slots, attributes}) {
  return {
    ...TagBinding,
    node,
    evaluate,
    slots,
    attributes,
    getComponent
  }
}
