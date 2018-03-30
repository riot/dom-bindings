(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.riotDOMBindings = {})));
}(this, (function (exports) { 'use strict';

/**
 * Binding object
 */
var Binding = {
  init(node, expressions) {
    Object.assign(this, {
      nodePrototype: node.cloneNode(true),
      node,
      expressions
    });

    return this
  },
  clone() {
    return this.init(
      this.nodePrototype.cloneNode(true),
      this.expressions
    )
  },
  unmount() {
    return this
  },
  update() {
    return this
  }
}

/**
 * Mathod that can be used recursively bind expressions to a DOM tree structure
 * @param   { HTMLElement } root - the root node where to start applying the bindings
 * @param   { Array } bindings - list of the expressions to bind
 * @returns { Array } bindings objects upgraded to a Binding object
 *
 * @example
 * riotDOMBindings.create(DOMtree, [{
 *     selector: '[expr0]',
 *     redundantAttribute: 'expr0',
 *     expressions: [
 *       { type: 'text', value(scope) { return scope.name }}
 *     ]
 *   }
 * ])
 */
function create(root, bindings) {
  return bindings.map(binding => {
    return upgrade(root, binding)
  })
}

/**
 * Upgrade a DOM node to a dom+expressions
 * @param   { String } options.selector - selector used to select the target of our expressions
 * @param   { String } options.redundantAttribute - attribute we want to remove (eventually used as selector)
 */
function upgrade(root, { selector, redundantAttribute, expressions }) {
  // find the node to apply the bindings
  const node = root.querySelector(selector);
  if (!node) throw new Error(`It was not possible to find any DOM node with the selector '${selector}' to bind your expressions`)
  // remove eventually additional attributes created only to select this node
  if (redundantAttribute) node.removeAttribute(redundantAttribute);

  return Object.assign({}, Binding).init(root, expressions)
}

exports.create = create;
exports.upgrade = upgrade;

Object.defineProperty(exports, '__esModule', { value: true });

})));
