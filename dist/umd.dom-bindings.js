(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.riotDOMBindings = {})));
}(this, (function (exports) { 'use strict';

  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */
  function cleanNode(node) {
    const children = node.childNodes;
    children.forEach(n => node.removeChild(n));
  }

  /* WIP */
  const eachBinding = Object.seal({
    mount(scope) {
      return this.update(scope)
    },
    /* eslint-disable */
    update(scope) {
      const value = this.evaulate(scope);
      const parent = this.placeholder.parentNode;
      const fragment = document.createDocumentFragment();

      // [...] @TODO: implement list updates

      this.value = value;
      this.expressionsBatch.update();

      return this
    },
    unmount() {
      this.expressionsBatch.unmount();
      return this
    }
  });
  /* eslint-enable */

  function create(node, { evaluate, template, expressions }) {
    const placeholder = document.createTextNode('');
    const parent = node.parentNode;

    parent.insertBefore(placeholder, node);
    parent.removeChild(node);

    return Object.assign({}, eachBinding, {
      node,
      evaluate,
      template,
      expressions,
      placeholder
    })
  }

  /**
   * Binding responsible for the `if` directive
   */
  const ifBinding = Object.seal({
    mount(scope) {
      swap(this.placeholder, this.node);
      return this.update(scope)
    },
    update(scope) {
      const value = this.evaluate(scope);
      const mustMount = !this.value && value;
      const mustUnmount = this.value && !value;
      const mustUpdate = value && this.template;

      if (mustMount) {
        swap(this.node, this.placeholder);
        if (this.template) {
          this.template = this.template.clone();
          this.template.mount(this.node, scope);
        }
      } else if (mustUnmount) {
        swap(this.placeholder, this.node);
        this.unmount(scope);
      } else if (mustUpdate) {
        this.template.update(scope);
      }

      this.value = value;

      return this
    },
    unmount(scope) {
      const { template } = this;
      if (template) {
        template.unmount(scope);
      }
      return this
    }
  });

  function swap(inNode, outNode) {
    const parent = outNode.parentNode;
    parent.insertBefore(inNode, outNode);
    parent.removeChild(outNode);
  }

  function create$1(node, { evaluate, template }) {
    return Object.assign({}, ifBinding, {
      node,
      evaluate,
      placeholder: document.createTextNode(''),
      template
    })
  }

  /**
   * This methods handles the DOM attributes updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {number} expression.name - attribute name
   * @param   {*} value - new expression value
   * @param   {*} oldValue - the old expression cached value
   * @returns {undefined}
   */
  function attributeExpression(node, { name }, value, oldValue) {
    // is it a spread operator? {...attributes}
    if (!name) {
      // is the value still truthy?
      if (value) {
        Object
          .entries(value)
          .forEach(([key, value]) => attributeExpression(node, { name: key }, value));
      } else if (oldValue) {
        // otherwise remove all the old attributes
        Object.keys(oldValue).forEach(key => node.removeAttribute(key));
      }
    } else {
      // handle boolean attributes
      if (typeof value === 'boolean') {
        node[name] = value;
      }

      node[getMethod(value)](name, normalizeValue(name, value));
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

  /**
   * This methods handles a simple text expression update
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {number} expression.childNodeIndex - index to find the text node to update
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function textExpression(node, { childNodeIndex }, value) {
    const target = node.childNodes[childNodeIndex];
    const val = normalizeValue$1(value);

    // replace the target if it's a placeholder comment
    if (target.nodeType === Node.COMMENT_NODE) {
      const textNode = document.createTextNode(val);
      node.replaceChild(textNode, target);
    } else {
      target.textContent = normalizeValue$1(val);
    }
  }

  /**
   * Normalize the user value in order to render a empty string in case of falsy values
   * @param   {*} value - user input value
   * @returns {string} hopefully a string
   */
  function normalizeValue$1(value) {
    return value || ''
  }

  /**
   * This methods handles the input fileds value updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function valueExpression(node, expression, value) {
    node.value = value;
  }

  var expressions = {
    text: textExpression,
    value: valueExpression,
    attribute: attributeExpression
  }

  const Expression = Object.seal({
    /**
     * Mount the expression evaluating its inital value
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    mount(scope) {
      // hopefully a pure function
      this.value = this.evaluate(scope);

      // IO() DOM updates
      apply(this, this.value);

      return this
    },
    /**
     * Update the expression if its value changed
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    update(scope) {
      // pure function
      const value = this.evaluate(scope);

      if (this.value !== value) {
        // IO() DOM updates
        apply(this, value);
        this.value = value;
      }

      return this
    },
    /**
     * Expression teardown method
     * @returns {Expression} self
     */
    unmount() {
      return this
    }
  });

  /**
   * IO() function to handle the DOM updates
   * @param {Expression} expression - expression object
   * @param {*} value - current expression value
   * @returns {undefined}
   */
  function apply(expression, value) {
    return expressions[expression.type](expression.node, expression, value, expression.value)
  }

  function create$2(node, expression) {
    return Object.assign({}, Expression, expression, {
      node
    })
  }

  /**
   * Create a flat object having as keys a list of methods that if dispatched will propagate
   * on the whole collection
   * @param   {Array} collection - collection to iterate
   * @param   {Array<string>} methods - methods to execute on each item of the collection
   * @param   {*} context - context returned by the new methods created
   * @returns {Object} a new object to simplify the the nested methods dispatching
   */
  function flattenCollectionMethods(collection, methods, context) {
    return methods.reduce((acc, method) => {
      return Object.assign(acc, {
        [method]: (scope) => {
          return collection.map(item => item[method](scope)) && context
        }
      })
    }, {})
  }

  function create$3(node, { expressions }) {
    return Object.assign({}, flattenCollectionMethods(
      expressions.map(expression => create$2(node, expression)),
      ['mount', 'update', 'unmount']
    ))
  }

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

  /**
   * Tags registry
   * It will contain the `tag-name`: TagImplementation objects
   */
  var registry = new Map()

  /**
   * Create a new tag object if it was registered before, othewise fallback to the simple
   * template chunk
   * @param   {string} name - tag name
   * @param   {Array<Object>} slots - array containing the slots markup
   * @param   {Array} bindings - DOM bindings
   * @param   {Array} attributes - dynamic attributes that will be received by the tag element
   * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
   */
  function getTag(name, slots = {}, bindings = [], attributes = []) {
    // if this tag was registered before we will return its implementation
    if (registry.has(name)) {
      return registry.get(name)({ slots, bindings, attributes })
    }

    // otherwise we return a template chunk
    return create$6(slotsToMarkup(slots), [...bindings, {
      // the attributes should be registered as binding
      // if we fallback to a normal template chunk
      expressions: attributes
    }])
  }

  /**
   * Merge all the slots together in a single markup string
   * @param   {Array<Object>} slots - slots collection
   * @returns {string} markup of all the slots in a single string
   */
  function slotsToMarkup(slots) {
    return slots.reduce((acc, slot) => {
      return acc + slot.html
    }, '')
  }

  function create$4(node, { name, slots, bindings, attributes }) {
    const tag = getTag(name, slots, bindings, attributes);

    return Object.assign({}, tag, {
      mount: curry(tag.mount)(node)
    })
  }

  var bindings = {
    if: create$1,
    simple: create$3,
    each: create,
    tag: create$4
  }

  /**
   * Bind a new expression object to a DOM node
   * @param   {HTMLElement} root - DOM node where to bind the expression
   * @param   {Object} binding - binding data
   * @returns {Expression} Expression object
   */
  function create$5(root, binding) {
    const { selector, type, redundantAttribute, expressions } = binding;
    // find the node to apply the bindings
    const node = selector ? root.querySelector(selector) : root;
    // remove eventually additional attributes created only to select this node
    if (redundantAttribute) node.removeAttribute(redundantAttribute);

    // init the binding
    return (bindings[type] || bindings.simple)(
      node,
      Object.assign({}, binding, {
        expressions: expressions || []
      })
    )
  }

  /**
   * Create a template node
   * @param   {string} html - template inner html
   * @returns {HTMLElement} the new template node just created
   */
  function createFragment(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template
  }

  /**
   * Template Chunk model
   * @type {Object}
   */
  const TemplateChunk = Object.seal({
    /**
     * Attatch the template to a DOM node
     * @param   {HTMLElement} el - target DOM node
     * @param   {*} scope - template data
     * @returns {TemplateChunk} self
     */
    mount(el, scope) {
      if (!el) throw new Error('Please provide DOM node to mount properly your template')

      if (this.el) this.unmount(scope);

      this.el = el;

      // clone the template DOM and append it to the target node
      el.appendChild(this.dom.cloneNode(true));

      // create the bindings
      this.bindings = this.bindingsData.map(binding => create$5(this.el, binding)), this.bindings.forEach(b => b.mount(scope));

      return this
    },
    /**
     * Update the template with fresh data
     * @param   {*} scope - template data
     * @returns {TemplateChunk} self
     */
    update(scope) {
      this.bindings.forEach(b => b.update(scope));

      return this
    },
    /**
     * Remove the template from the node where it was initially mounted
     * @param   {*} scope - template data
     * @returns {TemplateChunk} self
     */
    unmount(scope) {
      if (!this.el) throw new Error('This template was never mounted before')

      this.bindings.forEach(b => b.unmount(scope));
      cleanNode(this.el);
      this.el = null;

      return this
    },
    /**
     * Clone the template chunk
     * @returns {TemplateChunk} a new template chunk
     */
    clone() {
      return create$6(this.dom, this.bindingsData)
    }
  });

  /**
   * Create a template chunk wiring also the bindings
   * @param   {string} html - template string
   * @param   {Array} bindings - bindings collection
   * @returns {TemplateChunk} a new TemplateChunk copy
   */
  function create$6(html, bindings = []) {
    if (!html) throw new Error('The html element is required, please provide a string or a DOM node')
    const dom = typeof html === 'string' ? createFragment(html).content : html;

    return Object.assign({}, TemplateChunk, {
      dom,
      bindingsData: bindings
    })
  }

  /**
   * Method used to bind expressions to a DOM tree structure
   * @param   {HTMLElement|String} root - the root node where to start applying the bindings
   * @param   {Array} bindings - list of the expressions to bind
   * @returns {TemplateChunk} a new TemplateChunk object having the `update`,`mount`, `unmount` and `clone` methods
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

  exports.template = create$6;
  exports.registry = registry;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
