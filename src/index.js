/**
 * Method used to bind expressions to a DOM tree structure
 * @param   { HTMLElement|String } root - the root node where to start applying the bindings
 * @param   { Array } bindings - list of the expressions to bind
 * @returns { TemplateChunk } a new TemplateChunk object having the `update`,`mount`, `unmount` and `clone` methods
 *
 * @example
 * riotDOMBindings.template(`<div expr0> </div><div><p expr1> <section expr2></section></p>`, [
 *   {
 *     selector: '[expr0]',
 *     redundantAttribute: 'expr0',
 *     expressions: [
 *       { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.time }}
 *     ]
 *   },
 *   {
 *     selector: '[expr1]',
 *     redundantAttribute: 'expr1',
 *     expressions: [
 *       { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.name }},
 *      { type: 'attribute', name: 'style', evaluate(scope) { return scope.style }}
 *    ]
 *  },
 *  {
 *    selector: '[expr2]',
 *    redundantAttribute: 'expr2',
 *    type: 'if',
 *    evaluate(scope) { return scope.isVisible },
 *    template: riotDOMBindings.template('hello there')
 *  }
 * ])
 */
export { default as template } from './template'

export { default as tag } from './tag'