/**
 * This methods handles the DOM attributes updates
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - attribute name
 * @param   {*} value - new expression value
 * @param   {*} oldValue - the old expression cached value
 * @returns {undefined}
 */
export default function attributeExpression(node, { name }, value, oldValue) {
  // is it a spread operator? {...attributes}
  if (!name) {
    // is the value still truthy?
    if (value) {
      Object
        .entries(value)
        .forEach(([key, value]) => attributeExpression(node, { name: key }, value))
    } else if (oldValue) {
      // otherwise remove all the old attributes
      Object.keys(oldValue).forEach(key => node.removeAttribute(key))
    }
  } else {
    // handle boolean attributes
    if (typeof value === 'boolean') {
      node[name] = value
    }

    node[getMethod(value)](name, normalizeValue(name, value))
  }
}

/**
 * Get the attribute modifier method
 * @param   {*} value - if truthy we return `setAttribute` othewise `removeAttribute`
 * @returns {string} the node attribute modifier method name
 */
function getMethod(value) {
  return value ? 'setAttribute' : 'removeAttribute'
}

/**
 * Get the value as string
 * @param   {string} name - attribute name
 * @param   {*} value - user input value
 * @returns {string} input value as string
 */
function normalizeValue(name, value) {
  // be sure that expressions like selected={ true } will be always rendered as selected='selected'
  if (value === true) return name

  // array values will be joined with spaces
  return Array.isArray(value) ? value.join(' ') : value
}