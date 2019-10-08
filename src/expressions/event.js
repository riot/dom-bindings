const RE_EVENTS_PREFIX = /^on/

/**
 * Set a new event listener
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - event name
 * @param   {*} value - new expression value
 * @param   {*} oldValue - old expression value
 * @returns {value} the callback just received
 */
export default function eventExpression(node, { name }, value, oldValue) {
  const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '')

  if (oldValue) {
    node.removeEventListener(normalizedEventName, oldValue)
  }

  if (value) {
    node.addEventListener(normalizedEventName, value, false)
  }
}