import createHeadTailPlaceholders from './create-head-tail-placeholders'

/**
 * Create the template meta object in case of <template> fragments
 * @param   {TemplateChunk} componentTemplate - template chunk object
 * @returns {Object} the meta property that will be passed to the mount function of the TemplateChunk
 */
export default function createTemplateMeta(componentTemplate) {
  const fragment = componentTemplate.dom.cloneNode(true)
  const {head, tail} = createHeadTailPlaceholders()

  return {
    avoidDOMInjection: true,
    fragment,
    head,
    tail,
    children: [head, ...Array.from(fragment.childNodes), tail]
  }
}
