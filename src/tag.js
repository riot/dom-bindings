import registry from './registry'
import template from './template'

/**
 * Create a new tag object if it was registered before, othewise fallback to the simple
 * template chunk
 * @param   {string} name - tag name
 * @param   {Object} options - tag options
 * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
 */
export default function create(name, options) {
  // if this tag was registered before we will return its implementation
  if (registry.has(name)) {
    return Object.assign({}, registry.get(name), {
      options
    })
  }
  // otherwise we return a template chunk
  return template(options.html, options.bindings)
}