const RE_EVENTS_PREFIX = /^on/

const getCallbackAndOptions = value => Array.isArray(value) ? value : [value, false]

// see also https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38
const EventListener = {
  handleEvent(event) {
    this[event.type](event)
  }
}
const ListenersWeakMap = new WeakMap()

const createListener = node => {
  const listener = Object.create(EventListener)
  ListenersWeakMap.set(node, listener)
  return listener
}

/**
 * Set a new event listener
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - event name
 * @param   {*} value - new expression value
 * @returns {value} the callback just received
 */
export default function eventExpression(node, { name }, value) {
  const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '')
  const eventListener = ListenersWeakMap.get(node) || createListener(node)
  const [callback, options] = getCallbackAndOptions(value)
  const handler = eventListener[normalizedEventName]
  const mustRemoveEvent = handler && !callback
  const mustAddEvent = callback && !handler

  if (mustRemoveEvent) {
    node.removeEventListener(normalizedEventName, eventListener)
  }

  if (mustAddEvent) {
    node.addEventListener(normalizedEventName, eventListener, options)
  }

  eventListener[normalizedEventName] = callback
}