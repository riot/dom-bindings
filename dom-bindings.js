(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.riotDOMBindings = {})));
}(this, (function (exports) { 'use strict';

  var textExpression = Object.seal({
    mount(node, expression, ...args) {
      return Object.assign({}, this, { node, expression }).update(...args)
    },
    update(...args) {
      this.node.textContent = this.expression.value(...args);

      return this
    },
    unmount() {
      return this
    }
  })

  var ifExpression = Object.seal({
    mount(node, expression, ...args) {
      return Object.assign({}, this, {
        node,
        expression,
        placeholder: document.createTextNode('')
      }).update(...args)
    },
    update(...args) {
      const { chunk } = this.expression;
      const value = this.expression.value(...args);
      const mustMount = this.value && !value;
      const mustUnmount = !this.value && value;
      const mustUpdate = value && chunk;

      if (mustMount) {
        swap(this.node, this.placeholder);
        if (chunk)
          chunk.clone().mount(...args);
      } else if (mustUnmount) {
        swap(this.placeholder, this.node);
        this.unmount(...args);
      } else if (mustUpdate) {
        chunk.update(...args);
      }

      this.value = value;

      return this
    },
    unmount(...args) {
      const { chunk } = this.expression;
      if (chunk) chunk.unmount(...args);
      return this
    }
  })

  function swap(inNode, outNode) {
    const parent = outNode.parentNode;
    parent.insertBefore(inNode, outNode);
    parent.removeChild(outNode);
  }

  var eachExpression = Object.seal({
    mount(node, expression, ...args) {
      const placeholder = document.createTextNode('');
      const parent = node.parentNode;

      parent.insertBefore(placeholder, node);
      parent.removeChild(node);

      return Object.assign({}, this, {
        node,
        expression,
        placeholder
      }).update(...args)
    },
    update(...args) {
      /* eslint-disable */
      const value = this.expression.value(...args);
      const parent = this.placeholder.parentNode;
      const fragment = document.createDocumentFragment();

      // [...] @TODO: implement list updates

      this.value = value;
      /* eslint-enable */
      return this
    },
    unmount() {
      return this
    }
  })

  var registry = {
    text: textExpression,
    if: ifExpression,
    each: eachExpression
  }

  /**
   * Template Chunk model
   * @type {Object}
   */
  const TemplateChunk = Object.seal({
    mount(html, bindings) {
      const dom = this.dom || createTemplate(html).content;

      return Object.assign({}, this, {
        bindings: this.bindings || bindings,
        dom,
        proto: dom.cloneNode(true)
      })
    },
    update(...args) {
      this.bindings.update(...args);

      return this
    },
    unmount(...args) {
      this.bindings.unmount(...args);

      return this
    },
    clone() {
      const dom = this.proto.cloneNode(true);

      return Object.assign({}, this, {
        bindings: this.bindings.clone(dom),
        dom
      })
    }
  });

  /**
   * Create a template chunk wiring also the bindings
   * @param   { String } html - template string
   * @param   { Array } bindings - bindings collection
   * @returns { TemplateChunk } a new TemplateChunk copy
   */
  function create(html, bindings) {
    return Object.assign({}, TemplateChunk).init(html, bindings)
  }

  /**
   * Create a template node
   * @param   { String } html - template inner html
   * @returns { HTMLElement } the new template node just created
   */
  function createTemplate(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template
  }

  /**
   * Binding object
   */
  const Binding = Object.seal({
    init(node, data, ...args) {
      return Object.assign({}, this, {
        expressions: bind(node, data, ...args),
        data,
        node
      })
    },
    update(...args) {
      this.expressions.forEach(({ update }) => update(...args));
      return this
    },
    unmount(...args) {
      this.expressions.forEach(({ unmount }) => unmount(...args));
      return this
    },
    clone(node) {
      return this.init(node, this.data)
    }
  });

  /**
   * Bind a new expression object to a DOM node
   * @param   { HTMLElement } node - DOM node where to bind the expression
   * @param   { Array } expressions - expressions array
   * @param   { ...* } args - values needed to evaluate the expressions
   * @returns { Expression } Expression object
   */
  function bind(node, expressions, ...args) {
    return expressions.map(expression => {
      const { template, bindings } = expression;

      if (template && bindings) {
        if (expression.chunk) {
          expression.chunk = expression.chunk.clone();
        } else {
          const dom = createTemplate(template);
          expression.chunk = create(dom, create$1(dom.content, bindings, ...args));
        }
      }

      return Object.assign({}, registry[expression.type]).mount(node, expression, ...args)
    })
  }

  function create$1(root, expressions, ...args) {
    return Object.assign({}, Binding).init(root, expressions, ...args)
  }

  /**
   * Mathod that can be used recursively bind expressions to a DOM tree structure
   * @param   { HTMLElement } root - the root node where to start applying the bindings
   * @param   { Array } bindings - list of the expressions to bind
   * @param   { * } args - context needed to evaluate the expressions
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
   * ], { name: 'hi' })
   */
  function create$2(root, bindings, ...args) {
    return bindings.map(binding => {
      return upgrade(root, binding, ...args)
    })
  }

  /**
   * Upgrade a DOM node to a dom+expressions
   * @param   { String } options.selector - selector used to select the target of our expressions
   * @param   { String } options.redundantAttribute - attribute we want to remove (eventually used as selector)
   */
  function upgrade(root, { selector, redundantAttribute, expressions }, ...args) {
    // find the node to apply the bindings
    const node = selector ? root.querySelector(selector) : node;
    // remove eventually additional attributes created only to select this node
    if (redundantAttribute) node.removeAttribute(redundantAttribute);
    // create a new Binding object
    return create$1(root, expressions, ...args)
  }

  exports.create = create$2;
  exports.upgrade = upgrade;
  exports.chunk = create;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
