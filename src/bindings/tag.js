import { ATTRIBUTE } from '../expressions/expression-types'
import curry from 'curri'
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
    return component({ slots, attributes })
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
  return slots.reduce((acc, { bindings }) => acc.concat(bindings), [])
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

export default function create(node, { name, getComponent, slots, attributes }) {
  const tag = getTag(getComponent(name), slots, attributes)

  return {
    ...tag,
    mount: curry(tag.mount.bind(tag))(node)
  }
}