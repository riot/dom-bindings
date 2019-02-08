import domdiff from 'domdiff';

/**
 * Remove the child nodes from any DOM node
 * @param   {HTMLElement} node - target node
 * @returns {undefined}
 */
function cleanNode(node) {
  const children = node.childNodes;
  children.forEach(n => node.removeChild(n));
}

const EACH = 0;
const IF = 1;
const SIMPLE = 2;
const TAG = 3;

var bindingTypes = {
  EACH,
  IF,
  SIMPLE,
  TAG
};

const EachBinding = Object.seal({
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
  afterPlaceholder: null,
  placeholder: null,

  // API methods
  mount(scope) {
    return this.update(scope)
  },
  update(scope) {
    const { placeholder } = this;
    const collection = this.evaluate(scope);
    const items = collection ? Array.from(collection) : [];
    const parent = placeholder.parentNode;

    // prepare the diffing
    const { newChildrenMap, batches, futureNodes } = loopItems(items, scope, this);

    /**
     * DOM Updates
     */
    const before = this.tags[this.tags.length - 1];
    domdiff(parent, this.tags, futureNodes, {
      before: before ? before.nextSibling : placeholder.nextSibling
    });

    // trigger the mounts and the updates
    batches.forEach(fn => fn());

    // update the children map
    this.childrenMap = newChildrenMap;
    this.tags = futureNodes;

    return this
  },
  unmount() {
    Array
      .from(this.childrenMap.values())
      .forEach(({tag, context}) => {
        tag.unmount(context, true);
      });

    this.childrenMap = new Map();
    this.tags = [];

    return this
  }
});

/**
 * Check whether a tag must be filtered from a loop
 * @param   {Function} condition - filter function
 * @param   {Object} context - argument passed to the filter function
 * @returns {boolean} true if this item should be skipped
 */
function mustFilterItem(condition, context) {
  return condition ? Boolean(condition(context)) === false : false
}

/**
 * Get the context of the looped tag
 * @param   {string} options.itemName - key to identify the looped item in the new context
 * @param   {string} options.indexName - key to identify the index of the looped item
 * @param   {number} options.index - current index
 * @param   {*} options.item - collection item looped
 * @param   {*} options.scope - current parent scope
 * @returns {Object} enhanced scope object
 */
function getContext({itemName, indexName, index, item, scope}) {
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


/**
 * Loop the current tag items
 * @param   { Array } items - tag collection
 * @param   { * } scope - tag scope
 * @param   { EeachBinding } binding - each binding object instance
 * @returns { Object } data
 * @returns { Map } data.newChildrenMap - a Map containing the new children tags structure
 * @returns { Array } data.batches - array containing functions the tags lifecycle functions to trigger
 * @returns { Array } data.futureNodes - array containing the nodes we need to diff
 */
function loopItems(items, scope, binding) {
  const { condition, template, childrenMap, itemName, getKey, indexName, root } = binding;
  const filteredItems = new Set();
  const newChildrenMap = new Map();
  const batches = [];
  const futureNodes = [];

  items.forEach((item, i) => {
    // the real item index should be subtracted to the items that were filtered
    const index = i - filteredItems.size;
    const context = getContext({itemName, indexName, index, item, scope});
    const key = getKey ? getKey(context) : index;
    const oldItem = childrenMap.get(key);

    if (mustFilterItem(condition, context)) {
      filteredItems.add(oldItem);
      return
    }

    const tag = oldItem ? oldItem.tag : template.clone();
    const el = oldItem ? tag.el : root.cloneNode();

    if (!oldItem) {
      batches.push(() => tag.mount(el, context));
    } else {
      batches.push(() => tag.update(context));
    }

    futureNodes.push(el);

    // update the children map
    newChildrenMap.set(key, {
      tag,
      context,
      index
    });
  });

  return {
    newChildrenMap,
    batches,
    futureNodes
  }
}

function create(node, { evaluate, condition, itemName, indexName, getKey, template }) {
  const placeholder = document.createTextNode('');
  const parent = node.parentNode;
  const root = node.cloneNode();
  const offset = Array.from(parent.childNodes).indexOf(node);

  parent.insertBefore(placeholder, node);
  parent.removeChild(node);

  return {
    ...EachBinding,
    childrenMap: new Map(),
    node,
    root,
    offset,
    condition,
    evaluate,
    template: template.createDOM(node),
    getKey,
    indexName,
    itemName,
    placeholder
  }
}

/**
 * Binding responsible for the `if` directive
 */
const IfBinding = Object.seal({
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
    const value = !!this.evaluate(scope);
    const mustMount = !this.value && value;
    const mustUnmount = this.value && !value;

    switch (true) {
    case mustMount:
      swap(this.node, this.placeholder);
      if (this.template) {
        this.template = this.template.clone();
        this.template.mount(this.node, scope);
      }
      break
    case mustUnmount:
      swap(this.placeholder, this.node);
      this.unmount(scope);
      break
    default:
      if (value) this.template.update(scope);
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
    ...IfBinding,
    node,
    evaluate,
    placeholder: document.createTextNode(''),
    template: template.createDOM(node)
  }
}

const ATTRIBUTE = 0;
const EVENT = 1;
const TEXT = 2;
const VALUE = 3;

var expressionTypes = {
  ATTRIBUTE,
  EVENT,
  TEXT,
  VALUE
};

const REMOVE_ATTRIBUTE = 'removeAttribute';
const SET_ATTIBUTE = 'setAttribute';

/**
 * Add all the attributes provided
 * @param   {HTMLElement} node - target node
 * @param   {Object} attributes - object containing the attributes names and values
 * @returns {undefined} sorry it's a void function :(
 */
function setAllAttributes(node, attributes) {
  Object
    .entries(attributes)
    .forEach(([name, value]) => attributeExpression(node, { name }, value));
}

/**
 * Remove all the attributes provided
 * @param   {HTMLElement} node - target node
 * @param   {Object} attributes - object containing all the attribute names
 * @returns {undefined} sorry it's a void function :(
 */
function removeAllAttributes(node, attributes) {
  Object
    .keys(attributes)
    .forEach(attribute => node.removeAttribute(attribute));
}

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
      setAllAttributes(node, value);
    } else if (oldValue) {
      // otherwise remove all the old attributes
      removeAllAttributes(node, oldValue);
    }

    return
  }

  // handle boolean attributes
  if (typeof value === 'boolean') {
    node[name] = value;
  }

  node[getMethod(value)](name, normalizeValue(name, value));
}

/**
 * Get the attribute modifier method
 * @param   {*} value - if truthy we return `setAttribute` othewise `removeAttribute`
 * @returns {string} the node attribute modifier method name
 */
function getMethod(value) {
  return value && typeof value !== 'object' ? SET_ATTIBUTE : REMOVE_ATTRIBUTE
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

  return value
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
  [ATTRIBUTE]: attributeExpression,
  [EVENT]: eventExpression,
  [TEXT]: textExpression,
  [VALUE]: valueExpression
};

const Expression = Object.seal({
  // Static props
  node: null,
  value: null,

  // API methods
  /**
   * Mount the expression evaluating its initial value
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
 * Create a new tag object if it was registered before, otherwise fallback to the simple
 * template chunk
 * @param   {Function} component - component factory function
 * @param   {Array<Object>} slots - array containing the slots markup
 * @param   {Array} attributes - dynamic attributes that will be received by the tag element
 * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
 */
function getTag(component, slots = [], attributes = []) {
  // if this tag was registered before we will return its implementation
  if (component) {
    return component({ slots, attributes })
  }

  // otherwise we return a template chunk
  return create$6(slotsToMarkup(slots), [
    ...slotBindings(slots), {
    // the attributes should be registered as binding
    // if we fallback to a normal template chunk
      expressions: attributes.map(attr => {
        return {
          type: ATTRIBUTE,
          ...attr
        }
      })
    }
  ])
}


/**
 * Merge all the slots bindings into a single array
 * @param   {Array<Object>} slots - slots collection
 * @returns {Array<Bindings>} flatten bindings array
 */
function slotBindings(slots) {
  return slots.reduce((acc, { bindings }) => acc.concat(bindings), [])
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


const TagBinding = Object.seal({
  // dynamic binding properties
  node: null,
  evaluate: null,
  name: null,
  slots: null,
  tag: null,
  attributes: null,
  getComponent: null,

  mount(scope) {
    return this.update(scope)
  },
  update(scope) {
    const name = this.evaluate(scope);

    // simple update
    if (name === this.name) {
      this.tag.update(scope);
    } else {
      // unmount the old tag if it exists
      if (this.tag) {
        this.tag.unmount(scope);
      }

      // mount the new tag
      this.name = name;
      this.tag = getTag(this.getComponent(name), this.slots, this.attributes);
      this.tag.mount(this.node, scope);
    }

    return this
  },
  unmount(scope) {
    if (this.tag) {
      this.tag.unmount(scope);
    }

    return this
  }
});

function create$4(node, { evaluate, getComponent, slots, attributes }) {
  return {
    ...TagBinding,
    node,
    evaluate,
    slots,
    attributes,
    getComponent
  }
}

var bindings = {
  [IF]: create$1,
  [SIMPLE]: create$3,
  [EACH]: create,
  [TAG]: create$4
};

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
  return (bindings[type] || bindings[SIMPLE])(
    node,
    {
      ...binding,
      expressions: expressions || []
    }
  )
}

/**
 * Check if an element is part of an svg
 * @param   {HTMLElement}  el - element to check
 * @returns {boolean} true if we are in an svg context
 */
function isSvg(el) {
  const owner = el.ownerSVGElement;

  return !!owner || owner === null
}

// in this case a simple innerHTML is enough
function createHTMLTree(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content
}

// for svg nodes we need a bit more work
function creteSVGTree(html, container) {
  // create the SVGNode
  const svgNode = container.ownerDocument.importNode(
    new window.DOMParser()
      .parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`,
        'application/xml'
      )
      .documentElement,
    true
  );

  return svgNode
}

/**
 * Create the DOM that will be injected
 * @param {Object} root - DOM node to find out the context where the fragment will be created
 * @param   {string} html - DOM to create as string
 * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
 */
function createDOMTree(root, html) {
  if (isSvg(root)) return creteSVGTree(html, root)

  return createHTMLTree(html)
}

/**
 * Move all the child nodes from a source tag to another
 * @param   {HTMLElement} source - source node
 * @param   {HTMLElement} target - target node
 * @returns {undefined} it's a void method ¯\_(ツ)_/¯
 */

// Ignore this helper because it's needed only for svg tags
/* istanbul ignore next */
function moveChildren(source, target) {
  if (source.firstChild) {
    target.appendChild(source.firstChild);
    moveChildren(source, target);
  }
}

const SVG_RE = /svg/i;

/**
 * Inject the DOM tree into a target node
 * @param   {HTMLElement} el - target element
 * @param   {HTMLFragment|SVGElement} dom - dom tree to inject
 * @returns {undefined}
 */
function injectDOM(el, dom) {
  if (SVG_RE.test(el.tagName)) {
    moveChildren(dom, el);
  } else {
    el.appendChild(dom);
  }
}

/**
 * Create the Template DOM skeleton
 * @param   {HTMLElement} el - root node where the DOM will be injected
 * @param   {string} html - markup that will be injected into the root node
 * @returns {HTMLFragment} fragment that will be injected into the root node
 */
function createTemplateDOM(el, html) {
  return html && (typeof html === 'string' ?
    createDOMTree(el, html) :
    html)
}

/**
 * Template Chunk model
 * @type {Object}
 */
const TemplateChunk = Object.freeze({
  // Static props
  bindings: null,
  bindingsData: null,
  html: null,
  dom: null,
  el: null,

  /**
   * Create the template DOM structure that will be cloned on each mount
   * @param   {HTMLElement} el - the root node
   * @returns {TemplateChunk} self
   */
  createDOM(el) {
    // make sure that the DOM gets created before cloning the template
    this.dom = this.dom || createTemplateDOM(el, this.html);

    return this
  },

  // API methods
  /**
   * Attach the template to a DOM node
   * @param   {HTMLElement} el - target DOM node
   * @param   {*} scope - template data
   * @returns {TemplateChunk} self
   */
  mount(el, scope) {
    if (!el) throw new Error('Please provide DOM node to mount properly your template')

    if (this.el) this.unmount(scope);

    this.el = el;

    // create the DOM if it wasn't created before
    this.createDOM(el);

    if (this.dom) injectDOM(el, this.dom.cloneNode(true));

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
    if (this.el) {
      this.bindings.forEach(b => b.unmount(scope));
      cleanNode(this.el);

      if (mustRemoveRoot) {
        this.el.parentNode.removeChild(this.el);
      }

      this.el = null;
    }

    return this
  },
  /**
   * Clone the template chunk
   * @returns {TemplateChunk} a clone of this object resetting the this.el property
   */
  clone() {
    return {
      ...this,
      el: null
    }
  }
});

/**
 * Create a template chunk wiring also the bindings
 * @param   {string|HTMLElement} html - template string
 * @param   {Array} bindings - bindings collection
 * @returns {TemplateChunk} a new TemplateChunk copy
 */
function create$6(html, bindings = []) {
  return {
    ...TemplateChunk,
    html,
    bindingsData: bindings
  }
}

/**
 * Method used to bind expressions to a DOM node
 * @param   {string|HTMLElement} html - your static template html structure
 * @param   {Array} bindings - list of the expressions to bind to update the markup
 * @returns {TemplateChunk} a new TemplateChunk object having the `update`,`mount`, `unmount` and `clone` methods
 *
 * @example
 *
 * riotDOMBindings
 *  .template(
 *   `<div expr0><!----></div><div><p expr1><!----><section expr2></section></p>`,
 *   [
 *     {
 *       selector: '[expr0]',
 *       redundantAttribute: 'expr0',
 *       expressions: [
 *         {
 *           type: expressionTypes.TEXT,
 *           childNodeIndex: 0,
 *           evaluate(scope) {
 *             return scope.time;
 *           },
 *         },
 *       ],
 *     },
 *     {
 *       selector: '[expr1]',
 *       redundantAttribute: 'expr1',
 *       expressions: [
 *         {
 *           type: expressionTypes.TEXT,
 *           childNodeIndex: 0,
 *           evaluate(scope) {
 *             return scope.name;
 *           },
 *         },
 *         {
 *           type: 'attribute',
 *           name: 'style',
 *           evaluate(scope) {
 *             return scope.style;
 *           },
 *         },
 *       ],
 *     },
 *     {
 *       selector: '[expr2]',
 *       redundantAttribute: 'expr2',
 *       type: bindingTypes.IF,
 *       evaluate(scope) {
 *         return scope.isVisible;
 *       },
 *       template: riotDOMBindings.template('hello there'),
 *     },
 *   ]
 * )
 */

export { create$6 as template, create$5 as createBinding, bindingTypes, expressionTypes };
