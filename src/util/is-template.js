import isNil from './is-nil'
/**
 * Check if an element is a template tag
 * @param   {HTMLElement}  el - element to check
 * @returns {boolean} true if it's a <template>
 */
export default function isTemplate(el) {
  return !isNil(el.content)
}