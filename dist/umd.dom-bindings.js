(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.riotDOMBindings = {})));
}(this, (function (exports) { 'use strict';

  /**
   * Create a flat object having as keys a list of methods that if dispatched will propagate
   * on the whole collection
   * @param   { Array } collection - collection to iterate
   * @param   { Array<String> } methods - methods to execute on each item of the collection
   * @param   { * } context - context returned by the new methods created
   * @returns { Object } a new object to simplify the the nested methods dispatching
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

  /**
   * This methods handles a simple text expression update
   * @param   {HTMLElement} node - target node
   * @param   {object} expression - expression object
   * @param   {number} expression.childNodeIndex - index to find the text node to update
   * @param   {*} value - new expression value
   */
  function textExpression(node, { childNodeIndex }, value) {
    const target = node.childNodes[childNodeIndex];
    const val = normalizeValue(value);

    // replace the target if it's a placeholder comment
    if (target.nodeType === Node.COMMENT_NODE) {
      const textNode = document.createTextNode(val);
      node.replaceChild(textNode, target);
    } else {
      target.textContent = normalizeValue(val);
    }
  }

  /**
   * Normalize the user value in order to render a empty string in case of falsy values
   * @param   {*} value - user input value
   * @returns {string} hopefully a string
   */
  function normalizeValue(value) {
    return value || ''
  }

  /**
   * This methods handles the input fileds value updates
   * @param   {HTMLElement} node - target node
   * @param   {object} expression - expression object
   * @param   {*} value - new expression value
   */
  function valueExpression(node, expression, value) {
    node.value = value;
  }

  /**
   * This methods handles the DOM attributes updates
   * @param   {HTMLElement} node - target node
   * @param   {object} expression - expression object
   * @param   {number} expression.name - attribute name
   * @param   {*} value - new expression value
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

      node[getMethod(value)](name, normalizeValue$1(name, value));
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
  function normalizeValue$1(name, value) {
    // be sure that expressions like selected={ true } will be always rendered as selected='selected'
    if (value === true) return name

    // array values will be joined with spaces
    return Array.isArray(value) ? value.join(' ') : value
  }

  var expressions = {
    text: textExpression,
    value: valueExpression,
    attribute: attributeExpression
  }

  const Expression = Object.seal({
    init(node, expression) {
      return Object.assign(this, expression, {
        node
      })
    },
    mount(scope) {
      this.value = this.evaluate(scope);
      this.apply(this.value);

      return this
    },
    update(scope) {
      const value = this.evaluate(scope);

      if (this.value !== value) this.value = this.apply(value);

      return this
    },
    unmount() {
      return this
    },
    apply(value) {
      return expressions[this.type](this.node, this, value, this.value)
    }
  });

  function create(dom, expression) {
    return Object.create(Expression).init(dom, expression)
  }

  var simpleBinding = Object.seal({
    init(node, { expressions }) {
      return Object.assign(this, flattenCollectionMethods(
        expressions.map(expression => create(node, expression)),
        ['mount', 'update', 'unmount'],
        this
      ))
    }
  })

  /**
   * Binding responsible for the `if` directive
   */
  var ifBinding = Object.seal({
    init(node, { evaluate, template }) {
      return Object.assign(this, {
        node,
        evaluate,
        placeholder: document.createTextNode(''),
        template
      })
    },
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
  })

  function swap(inNode, outNode) {
    const parent = outNode.parentNode;
    parent.insertBefore(inNode, outNode);
    parent.removeChild(outNode);
  }

  /* WIP */
  var eachBinding = Object.seal({
    init(node, { evaluate, template, expressions }) {
      const placeholder = document.createTextNode('');
      const parent = node.parentNode;

      parent.insertBefore(placeholder, node);
      parent.removeChild(node);

      return Object.assign(this, {
        node,
        evaluate,
        template,
        expressions,
        placeholder
      })
    },
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
  })
  /* eslint-enable */

  var bindings = {
    if: ifBinding,
    simple: simpleBinding,
    each: eachBinding
  }

  /**
   * Bind a new expression object to a DOM node
   * @param   { HTMLElement } root - DOM node where to bind the expression
   * @param   { Object } binding - binding data
   * @returns { Expression } Expression object
   */
  function create$1(root, binding) {
    const { selector, type, redundantAttribute, expressions } = binding;
    // find the node to apply the bindings
    const node = selector ? root.querySelector(selector) : root;
    // remove eventually additional attributes created only to select this node
    if (redundantAttribute)
      node.removeAttribute(redundantAttribute);

    // init the binding
    return Object.create(bindings[type] || bindings.simple).init(
      node,
      Object.assign({}, binding, {
        expressions: expressions || []
      })
    )
  }

  /**
   * Create a template node
   * @param   { String } html - template inner html
   * @returns { HTMLElement } the new template node just created
   */
  function createFragment(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template
  }

  /**
   * Remove the child nodes from any DOM node
   * @param   { HTMLElement } node - target node
   */
  function cleanNode(node) {
    const children = node.childNodes;

    while (children.length) {
      node.removeChild(children[0]);
    }
  }

  /**
   * Template Chunk model
   * @type {Object}
   */
  const TemplateChunk = Object.seal({
    init(dom, bindings, attach) {
      return Object.assign(this, {
        dom,
        bindingsData: bindings,
        attach
      })
    },
    /**
     * Attatch the template to a DOM node
     * @param   { HTMLElement } el - target DOM node
     * @param   { * } scope - template data
     * @returns { TemplateChunk } self
     */
    mount(el, scope) {
      if (!el) throw new Error('Please provide DOM node to mount properly your template')

      if (this.el) this.unmount(scope);

      this.el = el;

      const root = this.attach();

      // create the bindings
      this.bindings = this.bindingsData.map(binding => create$1(root, binding)), this.bindings.forEach(b => b.mount(scope));

      return this
    },
    /**
     * Update the template with fresh data
     * @param   { * } scope - template data
     * @returns { TemplateChunk } self
     */
    update(scope) {
      this.bindings.forEach(b => b.update(scope));

      return this
    },
    /**
     * Remove the template from the node where it was initially mounted
     * @param   { * } scope - template data
     * @returns { TemplateChunk } self
     */
    unmount(scope) {
      if (!this.el) throw new Error('This template was never mounted before')

      this.bindings.forEach(b => b.unmount(scope));
      cleanNode(this.el);

      // todo: Can we detatch this.el.shadowRoot?

      this.el = null;

      return this
    },
    /**
     * Clone the template chunk
     * @returns { TemplateChunk } a new template chunk
     */
    clone() {
      return create$2(this.dom, this.bindingsData, { attach: this.attatch })
    }
  });

  /**
   * Hosting strategy on light DOM
   */
  function attachDOM() {
    // clone the template DOM and append it to the target node
    this.el.appendChild(this.dom.cloneNode(true));
    return this.el
  }

  /**
   * Hosting strategy on shadow DOM
   */
  const attachShadowDOM = 'attachShadow' in Element.prototype ?
    function attachShadowDOM() {
      // clone the template DOM and append it to shadowRoot of the target node
      const shadowRoot = this.el.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(this.dom.cloneNode(true));
      return shadowRoot.host
    }:
    function attachShadowDOM() {
      throw new Error('Shadow DOM is unavailable on your browser')
    };

  /**
   * Create a template chunk wiring also the bindings
   * @param   { String } html - template string
   * @param   { Array } bindings - bindings collection
   * @param   { Object= } options - options
   * @param   { String= } options.attatch - host on Shadow DOM if 'shadow', host on DOM otherwise 
   * @returns { TemplateChunk } a new TemplateChunk copy
   */
  function create$2(html, bindings = [], options = {}) {
    if (!html) throw new Error('The html element is required, please provide a string or a DOM node')
    const dom = typeof html === 'string' ? createFragment(html).content : html;
    const attach = options.attach === undefined ? attachDOM : options.attach === 'shadow' ? attachShadowDOM : options.attach;
    return Object.create(TemplateChunk).init(dom, bindings, attach)
  }

  /* TODO: create the riot tag bindings */
  var tag = Object.seal({
    init() {
      return this
    },
    mount() {
      return this
    },
    update() {
      return this
    },
    unmount() {
      return this
    }
  })

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

  exports.template = create$2;
  exports.tag = tag;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
