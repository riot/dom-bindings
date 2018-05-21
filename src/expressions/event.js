/**
 * Set a new event listener
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - event name
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
export default function eventExpression(node, { name }, value) {
  node[name] = value
}