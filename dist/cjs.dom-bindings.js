'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
  // dynamic binding properties
  childrenMap: null,
  node: null,
  root: null,
  condition: null,
  evaluate: null,
  template: null,
  tags: [],
  getKey: null,
  indexName: null,
  itemName: null,
  placeholder: null,

  // API methods
  mount(scope) {
    return this.update(scope)
  },
  update(scope) {
    const { condition, offset, template, childrenMap, itemName, getKey, indexName, root } = this;
    const newItems = Array.from(this.evaluate(scope)) || [];
    const oldTags = this.tags.slice(); // eslint-disable-line
    const fragment = document.createDocumentFragment();
    const parent = this.placeholder.parentNode;
    const filteredItems = new Set();

    this.tags = [];

    newItems.forEach((item, i) => {
      // the real item index should be subtracted to the items that were filtered
      const index = i - filteredItems.size;
      const children = parent.children;
      const context = getContext(itemName, indexName, index, item, scope);
      const key = getKey(context);
      const oldItem = childrenMap.get(key);
      const mustAppend = index >= oldTags.length;
      const child = children[index + offset];
      let tag; // eslint-disable-line

      if (mustFilterItem(condition, oldItem, context)) {
        remove(oldItem.tag, item, childrenMap);
        filteredItems.add(oldItem);
        return
      }

      if (!oldItem) {
        tag = template.clone();
        const el = root.cloneNode();

        tag.mount(el, context);

        if (mustAppend) {
          fragment.appendChild(el);
        } else {
          parent.insertBefore(el, oldTags[index].el);
        }
      } else if (oldItem.index !== index) {
        tag = oldTags[oldItem.index];

        childrenMap.set(key, {
          tag,
          index
        });

        tag.update(context);
      } else {
        tag = oldTags[index];
        tag.update(context);
      }

      if (oldItem && child !== tag.el) {
        parent.insertBefore(tag.el, child);
      }

      childrenMap.set(key, {
        tag,
        index
      });

      this.tags.push(tag); // eslint-disable-line
    });

    if (oldTags.length > newItems.length) {
      removeRedundant(oldTags.length - newItems.length, childrenMap);
    }

    parent.insertBefore(fragment, this.placeholder);

    return this
  },
  unmount() {
    removeRedundant(this.tags.length, this.childrenMap);

    return this
  }
});

function removeRedundant(length, childrenMap) {
  const entries = Array.from(childrenMap.entries());

  return Array(length).fill(null).map(() => {
    const [item, value] = entries[entries.length - 1];
    const { tag } = value;
    remove(tag, item, childrenMap);
    return item
  })
}

function mustFilterItem(condition, oldItem, context) {
  return !!oldItem && condition ? condition(context) : false
}

function remove(tag, item, childrenMap) {
  tag.unmount(item, true);
  childrenMap.delete(item);
}

function getContext(itemName, indexName, index, item, scope) {
  const context = {
    [itemName]: item,
    ...scope
  };

  if (indexName) {
    return {
      [indexName]: index,
      ...context
    }
  }

  return context
}

function create(node, { evaluate, condition, itemName, indexName, getKey, template }) {
  const placeholder = document.createTextNode('');
  const parent = node.parentNode;
  const root = node.cloneNode();
  const offset = Array.from(parent.children).indexOf(node);

  parent.insertBefore(placeholder, node);
  parent.removeChild(node);

  return {
    ...eachBinding,
    childrenMap: new Map(),
    node,
    root,
    offset,
    condition,
    evaluate,
    template,
    getKey,
    indexName,
    itemName,
    placeholder
  }
}

/**
 * Binding responsible for the `if` directive
 */
const ifBinding = Object.seal({
  // dynamic binding properties
  node: null,
  evaluate: null,
  placeholder: null,
  template: '',

  // API methods
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
  return {
    ...ifBinding,
    node,
    evaluate,
    placeholder: document.createTextNode(''),
    template
  }
}

const REMOVE_ATTRIBUTE = 'removeAttribute';
const SET_ATTIBUTE = 'setAttribute';

/**
 * This methods handles the DOM attributes updates
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - attribute name
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
  return value ? SET_ATTIBUTE : REMOVE_ATTRIBUTE
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
 * Set a new event listener
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - event name
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
function eventExpression(node, { name }, value) {
  node[name] = value;
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
    target.data = normalizeValue$1(val);
  }
}

/**
 * Normalize the user value in order to render a empty string in case of falsy values
 * @param   {*} value - user input value
 * @returns {string} hopefully a string
 */
function normalizeValue$1(value) {
  return value != null ? value : ''
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
  attribute: attributeExpression,
  event: eventExpression,
  text: textExpression,
  value: valueExpression
}

const Expression = Object.seal({
  // Static props
  node: null,
  value: null,

  // API methods
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

function create$2(node, data) {
  return {
    ...Expression,
    ...data,
    node
  }
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
    return {
      ...acc,
      [method]: (scope) => {
        return collection.map(item => item[method](scope)) && context
      }
    }
  }, {})
}

function create$3(node, { expressions }) {
  return {
    ...flattenCollectionMethods(
      expressions.map(expression => create$2(node, expression)),
      ['mount', 'update', 'unmount']
    )
  }
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
 * It will contain the pair { `tag-name`: tag creation function }
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
function getTag(name, slots = [], bindings = [], attributes = []) {
  // if this tag was registered before we will return its implementation
  if (registry.has(name)) {
    return registry.get(name)({ slots, bindings, attributes })
  }

  // otherwise we return a template chunk
  return create$6(slotsToMarkup(slots), [...bindings, {
    // the attributes should be registered as binding
    // if we fallback to a normal template chunk
    expressions: attributes.map(attr => {
      return {
        type: 'attribute',
        ...attr
      }
    })
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

  return {
    ...tag,
    mount: curry(tag.mount.bind(tag))(node)
  }
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
    {
      ...binding,
      expressions: expressions || []
    }
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
  // Static props
  bindings: null,
  bindingsData: null,
  dom: null,
  el: null,

  // API methods
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
    if (this.dom) el.appendChild(this.dom.cloneNode(true));

    // create the bindings
    this.bindings = this.bindingsData.map(binding => create$5(this.el, binding));
    this.bindings.forEach(b => b.mount(scope));

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
   * @param   {boolean} mustRemoveRoot - if true remove the root element
   * @returns {TemplateChunk} self
   */
  unmount(scope, mustRemoveRoot) {
    if (!this.el) throw new Error('This template was never mounted before')

    this.bindings.forEach(b => b.unmount(scope));
    cleanNode(this.el);

    if (mustRemoveRoot) {
      this.el.parentNode.removeChild(this.el);
    }

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
  const dom = typeof html === 'string' ? createFragment(html).content : html;

  return {
    ...TemplateChunk,
    dom,
    bindingsData: bindings
  }
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
exports.createBinding = create$5;
