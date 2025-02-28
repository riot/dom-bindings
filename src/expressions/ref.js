/**
   This method handles the REF attribute expressions 
 * @param   {HTMLElement} expression.node - target node
 * @param   {*} expression.value - the old expression cached value
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
export default function refExpression({ node, value: oldValue }, value) {
  // called on mount and update
  if (value) value(node)
  // called on unmount
  // in this case the node value is null
  else oldValue(null)
}
