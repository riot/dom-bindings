import curry from 'curri'
import registry from '../registry'
import template from '../template'

/**
 * Create a new tag object if it was registered before, othewise fallback to the simple
 * template chunk
 * @param   {string} name - tag name
 * @param   {Array<Object>} slots - array containing the slots markup
 * @param   {Array} bindings - DOM bindings
 * @param   {Array} attributes - dynamic attributes that will be received by the tag element
 * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
 */
function getTag(name, slots = [], bindings = [], attributes = []) {
  // if this tag was registered before we will return its implementation
  if (registry.has(name)) {
    return registry.get(name)({ slots, bindings, attributes })
  }

  // otherwise we return a template chunk
  return template(slotsToMarkup(slots), [...bindings, {
    // the attributes should be registered as binding
    // if we fallback to a normal template chunk
    expressions: attributes.map(attr => {
      return {
        type: 'attribute',
        ...attr
      }
    })
  }])
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

export default function create(node, { name, slots, bindings, attributes }) {
  const tag = getTag(name, slots, bindings, attributes)

  return {
    ...tag,
    mount: curry(tag.mount.bind(tag))(node)
  }
}