(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.riotDOMBindings = {})));
}(this, (function (exports) { 'use strict';

  /**
   * Function to curry any javascript method
   * @param   {Function}  fn - the target function we want to curry
   * @param   {...[args]} acc - initial arguments
   * @returns {Function|*} it will return a function until the target function
   *                       will receive all of its arguments
   */
  function curry(fn, ...acc) {
    return (...args) => {
      args = [...acc, ...args];

      return args.length < fn.length ?
        curry(fn, ...args) :
        fn(...args)
    }
  }

  var textExpression = {
    mount(node, expression) {
      Object.assign(this, { node, expression });
    },
    update(...args) {
      this.node.textContent = this.expression.value(...args);

      return this
    },
    unmount() {
      return this
    }
  }

  var ifExpression = {
    mount(node, expression) {
      Object.assign(this, {
        node,
        expression,
        expressions: expression.bindings.map(expression => create$1(node, expression)),
        placeholder: document.createTextNode('')
      });

      swap(this.node.parentNode, this.placeholder, this.node);
    },
    update(...args) {
      this.value = this.expression.value(...args);
      console.log(this.value);
      return this
    },
    unmount() {
      return this
    }
  }

  function swap(parent, inNode, outNode) {
    parent.insertBefore(inNode, outNode);
    parent.removeChild(outNode);
  }

  var expressions = {
    text: textExpression,
    if: ifExpression
  }

  /**
   * Create a new expression object
   * @param   { HTMLElement } node - DOM node where to bind the expression
   * @param   { Object } expression - expression properties
   * @returns { Expression } Expression object
   */
  function create(node, expression) {
    return Object.assign({}, expressions[expression.type]).mount(node, expression)
  }

  /**
   * Binding object
   */
  var Binding = {
    init(node, expressionsData) {
      Object.assign(this, {
        nodePrototype: node.cloneNode(true),
        expressionsData,
        expressions: expressionsData.map(expression => create(node, expression)),
        node
      });

      // add the update and unmount methods
      this.update = curry(exec)(this.expressions, 'update');
      this.unmount = curry(exec)(this.expressions, 'unmount');

      return this
    },
    clone() {
      return this.init(
        this.nodePrototype.cloneNode(true),
        this.expressionsData
      )
    }
  }

  /**
   * Execute a single method on all the expressions list
   * @param   { Array } expressions - list of expressions
   * @param   { String } method - expression method to execute
   * @param   {...*} args - expression method caller arguments
   * @returns { Array }
   */
  function exec(expressions, method, ...args) {
    return expressions.map(expression => expression[method](...args))
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
  function create$1(root, bindings) {
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
    // create a new Binding object
    return Object.assign({}, Binding).init(root, expressions)
  }

  exports.create = create$1;
  exports.upgrade = upgrade;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
