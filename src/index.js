
/**
 * Mathod that can be used recursively bind expressions to a DOM tree structure
 * @param   { HTMLElement } root - the root node where to start applying the bindings
 * @param   { Object } binding - binding object
 * @returns { Object } a new binding object having the `update`,`mount`, `unmount` methods
 *
 * @example
 * riotDOMBindings.bind(DOMTree, {
 *     selector: '[expr0]',
 *     redundantAttribute: 'expr0',
 *     type: 'each'
 *     evaluate(scope) { return scope.getItems() },
 *     key: 'item'
 *     expressions: [
 *       { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.item.name }}
 *     ]
 *   }
 * })
 */
export { default as bind } from './binding'

/**
 * Method used to bind expressions to a DOM tree structure
 * @param   { HTMLElement|String } root - the root node where to start applying the bindings
 * @param   { Array } bindings - list of the expressions to bind
 * @returns { TemplateChunk } a new TemplateChunk object having the `update`,`mount`, `unmount` methods
 *
 * @example
 * riotDOMBindings.create('<p expr0></p><div>Hello there</div>', [{
 *     selector: '[expr0]',
 *     redundantAttribute: 'expr0',
 *     type: 'simple',
 *     expressions: [
 *       { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.name }}
 *     ]
 *   }
 * ])
 */
export { default as create } from './template'