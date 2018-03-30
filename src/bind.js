import expressions from './expressions'

/**
 * Bind a new expression object to a DOM node
 * @param   { HTMLElement } node - DOM node where to bind the expression
 * @param   { Object } expression - expression properties
 * @param   { ...* } args - values needed to evaluate the expressions
 * @returns { Expression } Expression object
 */
export default function bind(node, expression, ...args) {
  return Object.assign({}, expressions[expression.type]).mount(node, expression, ...args)
}