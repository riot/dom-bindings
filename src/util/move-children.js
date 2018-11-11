/**
 * Move all the child nodes from a source tag to another
 * @param   {HTMLElement} source - source node
 * @param   {HTMLElement} target - target node
 * @returns {undefined} it's a void method ¯\_(ツ)_/¯
 */

// Ignore this helper because it's needed only for svg tags
/* istanbul ignore next */
export default function moveChildren(source, target) {
  if (source.firstChild) {
    target.appendChild(source.firstChild)
    moveChildren(source, target)
  }
}