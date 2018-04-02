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

  function textExpression(node, expression, value) {
    node.childNodes[expression.childNodeIndex].textContent = value;
  }

  function valueExpression(node, expression, value) {
    node.value = value;
  }

  function attributeExpression(node, expression, value) {
    node[value ? 'setAttribute' : 'removeAttribute'](expression.name, value);
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

      if (this.value !== value)
        this.value = this.apply(value);

      return this
    },
    unmount() {
      return this
    },
    apply(value) {
      return expressions[this.type](this.node, this, value)
    }
  });

  function create(dom, expression) {
    return Object.create(Expression).init(dom, expression)
  }

  var defaultBinding = Object.seal({
    init(node, { expressions }) {
      return Object.assign(this, flattenCollectionMethods(
        expressions.map(expression => create(node, expression)),
        ['mount', 'update', 'unmount'],
        this
      ))
    }
  })

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
   * Binding responsible for the `if` directive
   */
  var ifBinding = Object.seal({
    init(node, { evaluate, template, expressions }) {
      return Object.assign(this, {
        node,
        expressions,
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
          this.template.mount(scope);
          this.node.appendChild(this.template.dom);
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
        cleanNode(this.node);
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
    default: defaultBinding,
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
    const node = selector ? root.querySelector(selector) : node;
    // remove eventually additional attributes created only to select this node
    if (redundantAttribute)
      node.removeAttribute(redundantAttribute);

    // init the binding
    return Object.create(bindings[type] || bindings.default).init(
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
   * Template Chunk model
   * @type {Object}
   */
  const TemplateChunk = Object.seal({
    init(html, bindings = []) {
      const dom = typeof html === 'string' ? createFragment(html).content : html;
      const proto = dom.cloneNode(true);
      // create the bindings and batch them together
      const { mount, update, unmount } = flattenCollectionMethods(
        bindings.map(binding => create$1(dom, binding)),
        ['mount', 'update', 'unmount'],
        this
      );

      return Object.assign(this, {
        mount,
        update,
        unmount,
        bindings,
        dom,
        proto
      })
    },
    /**
     * Clone the template chunk
     * @returns { TemplateChunk } a new template chunk
     */
    clone() {
      return create$2(this.proto.cloneNode(true), this.bindings)
    }
  });

  /**
   * Create a template chunk wiring also the bindings
   * @param   { String } html - template string
   * @param   { Array } bindings - bindings collection
   * @returns { TemplateChunk } a new TemplateChunk copy
   */
  function create$2(html, bindings) {
    return Object.create(TemplateChunk).init(html, bindings)
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
   *    selector: '[expr0]',
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
   *    template: riotDOMBindings.create('hello there')
   *  }
   * ])
   */

  exports.template = create$2;
  exports.tag = tag;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
