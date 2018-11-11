/**
 * Check if an element is part of an svg
 * @param   {HTMLElement}  el - element to check
 * @returns {boolean} true if we are in an svg context
 */
export default function isSvg(el) {
  const owner = el.ownerSVGElement

  return !!owner || owner === null
}