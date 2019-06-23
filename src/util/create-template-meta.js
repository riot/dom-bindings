/**
 * Create the template meta object in case of <template> fragments
 * @param   {TemplateChunk} componentTemplate - template chunk object
 * @returns {Object} the meta property that will be passed to the mount function of the TemplateChunk
 */
export default function createTemplateMeta(componentTemplate) {
  const fragment = componentTemplate.dom.cloneNode(true)

  return {
    avoidDOMInjection: true,
    fragment,
    children: Array.from(fragment.childNodes)
  }
}
