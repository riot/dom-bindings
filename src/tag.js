import attributeExpression from './expressions/attribute'
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
  const el = document.createElement(name)

  // set the static attributes on the DOM node
  if (options.attributes) {
    attributeExpression(el, null, options.attributes)
  }

  // if this tag was registered before we
  if (registry.has(name)) {
    return Object.assign({}, registry.get(name), {
      el,
      options
    })
  }

  return fallbackToTemplate(el, options)
}


function fallbackToTemplate(el, options) {
  el.innerHTML = options.template
  return template(el, options.bindings)
}