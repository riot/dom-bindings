import {
  insertBefore,
  removeChild,
  replaceChild,
  cleanNode,
  moveChildren,
  clearChildren,
} from '@riotjs/util/dom'
import { PARENT_KEY_SYMBOL, IS_PURE_SYMBOL } from '@riotjs/util/constants'
import { IF, SIMPLE, EACH, TAG, SLOT } from '@riotjs/util/binding-types'
export { default as bindingTypes } from '@riotjs/util/binding-types'
import { ATTRIBUTE, EVENT, TEXT, VALUE } from '@riotjs/util/expression-types'
export { default as expressionTypes } from '@riotjs/util/expression-types'
import { defineProperty } from '@riotjs/util/objects'
import {
  isTemplate,
  isBoolean,
  isObject,
  isFunction,
  isNil,
  isSvg,
} from '@riotjs/util/checks'
import { memoize, evaluateAttributeExpressions, panic } from '@riotjs/util/misc'

const HEAD_SYMBOL = Symbol()
const TAIL_SYMBOL = Symbol()

/**
 * Create the <template> fragments text nodes
 * @return {Object} {{head: Text, tail: Text}}
 */
function createHeadTailPlaceholders() {
  const head = document.createTextNode('')
  const tail = document.createTextNode('')

  head[HEAD_SYMBOL] = true
  tail[TAIL_SYMBOL] = true

  return { head, tail }
}

/**
 * Create the template meta object in case of <template> fragments
 * @param   {TemplateChunk} componentTemplate - template chunk object
 * @returns {Object} the meta property that will be passed to the mount function of the TemplateChunk
 */
function createTemplateMeta(componentTemplate) {
  const fragment = componentTemplate.dom.cloneNode(true)
  const { head, tail } = createHeadTailPlaceholders()

  return {
    avoidDOMInjection: true,
    fragment,
    head,
    tail,
    children: [head, ...Array.from(fragment.childNodes), tail],
  }
}

/* c8 ignore start */
/**
 * ISC License
 *
 * Copyright (c) 2020, Andrea Giammarchi, @WebReflection
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
 * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */

// fork of https://github.com/WebReflection/udomdiff version 1.1.0
// due to https://github.com/WebReflection/udomdiff/pull/2
/* eslint-disable */

/**
 * @param {Node[]} a The list of current/live children
 * @param {Node[]} b The list of future children
 * @param {(entry: Node, action: number) => Node} get
 * The callback invoked per each entry related DOM operation.
 * @param {Node} [before] The optional node used as anchor to insert before.
 * @returns {Node[]} The same list of future children.
 */
const udomdiff = (a, b, get, before) => {
  const bLength = b.length
  let aEnd = a.length
  let bEnd = bLength
  let aStart = 0
  let bStart = 0
  let map = null
  while (aStart < aEnd || bStart < bEnd) {
    // append head, tail, or nodes in between: fast path
    if (aEnd === aStart) {
      // we could be in a situation where the rest of nodes that
      // need to be added are not at the end, and in such case
      // the node to `insertBefore`, if the index is more than 0
      // must be retrieved, otherwise it's gonna be the first item.
      const node =
        bEnd < bLength
          ? bStart
            ? get(b[bStart - 1], -0).nextSibling
            : get(b[bEnd - bStart], 0)
          : before
      while (bStart < bEnd) insertBefore(get(b[bStart++], 1), node)
    }
    // remove head or tail: fast path
    else if (bEnd === bStart) {
      while (aStart < aEnd) {
        // remove the node only if it's unknown or not live
        if (!map || !map.has(a[aStart])) removeChild(get(a[aStart], -1))
        aStart++
      }
    }
    // same node: fast path
    else if (a[aStart] === b[bStart]) {
      aStart++
      bStart++
    }
    // same tail: fast path
    else if (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--
      bEnd--
    }
    // The once here single last swap "fast path" has been removed in v1.1.0
    // https://github.com/WebReflection/udomdiff/blob/single-final-swap/esm/index.js#L69-L85
    // reverse swap: also fast path
    else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      // this is a "shrink" operation that could happen in these cases:
      // [1, 2, 3, 4, 5]
      // [1, 4, 3, 2, 5]
      // or asymmetric too
      // [1, 2, 3, 4, 5]
      // [1, 2, 3, 5, 6, 4]
      const node = get(a[--aEnd], -1).nextSibling
      insertBefore(get(b[bStart++], 1), get(a[aStart++], -1).nextSibling)
      insertBefore(get(b[--bEnd], 1), node)
      // mark the future index as identical (yeah, it's dirty, but cheap 👍)
      // The main reason to do this, is that when a[aEnd] will be reached,
      // the loop will likely be on the fast path, as identical to b[bEnd].
      // In the best case scenario, the next loop will skip the tail,
      // but in the worst one, this node will be considered as already
      // processed, bailing out pretty quickly from the map index check
      a[aEnd] = b[bEnd]
    }
    // map based fallback, "slow" path
    else {
      // the map requires an O(bEnd - bStart) operation once
      // to store all future nodes indexes for later purposes.
      // In the worst case scenario, this is a full O(N) cost,
      // and such scenario happens at least when all nodes are different,
      // but also if both first and last items of the lists are different
      if (!map) {
        map = new Map()
        let i = bStart
        while (i < bEnd) map.set(b[i], i++)
      }
      // if it's a future node, hence it needs some handling
      if (map.has(a[aStart])) {
        // grab the index of such node, 'cause it might have been processed
        const index = map.get(a[aStart])
        // if it's not already processed, look on demand for the next LCS
        if (bStart < index && index < bEnd) {
          let i = aStart
          // counts the amount of nodes that are the same in the future
          let sequence = 1
          while (++i < aEnd && i < bEnd && map.get(a[i]) === index + sequence)
            sequence++
          // effort decision here: if the sequence is longer than replaces
          // needed to reach such sequence, which would brings again this loop
          // to the fast path, prepend the difference before a sequence,
          // and move only the future list index forward, so that aStart
          // and bStart will be aligned again, hence on the fast path.
          // An example considering aStart and bStart are both 0:
          // a: [1, 2, 3, 4]
          // b: [7, 1, 2, 3, 6]
          // this would place 7 before 1 and, from that time on, 1, 2, and 3
          // will be processed at zero cost
          if (sequence > index - bStart) {
            const node = get(a[aStart], 0)
            while (bStart < index) insertBefore(get(b[bStart++], 1), node)
          }
          // if the effort wasn't good enough, fallback to a replace,
          // moving both source and target indexes forward, hoping that some
          // similar node will be found later on, to go back to the fast path
          else {
            replaceChild(get(b[bStart++], 1), get(a[aStart++], -1))
          }
        }
        // otherwise move the source forward, 'cause there's nothing to do
        else aStart++
      }
      // this node has no meaning in the future list, so it's more than safe
      // to remove it, and check the next live node out instead, meaning
      // that only the live list index should be forwarded
      else removeChild(get(a[aStart++], -1))
    }
  }
  return b
}

const UNMOUNT_SCOPE = Symbol('unmount')

const EachBinding = {
  // dynamic binding properties
  // childrenMap: null,
  // node: null,
  // root: null,
  // condition: null,
  // evaluate: null,
  // template: null,
  // isTemplateTag: false,
  nodes: [],
  // getKey: null,
  // indexName: null,
  // itemName: null,
  // afterPlaceholder: null,
  // placeholder: null,

  // API methods
  mount(scope, parentScope) {
    return this.update(scope, parentScope)
  },
  update(scope, parentScope) {
    const { placeholder, nodes, childrenMap } = this
    const collection = scope === UNMOUNT_SCOPE ? null : this.evaluate(scope)
    const items = collection ? Array.from(collection) : []

    // prepare the diffing
    const { newChildrenMap, batches, futureNodes } = createPatch(
      items,
      scope,
      parentScope,
      this,
    )

    // patch the DOM only if there are new nodes
    udomdiff(
      nodes,
      futureNodes,
      patch(Array.from(childrenMap.values()), parentScope),
      placeholder,
    )

    // trigger the mounts and the updates
    batches.forEach((fn) => fn())

    // update the children map
    this.childrenMap = newChildrenMap
    this.nodes = futureNodes

    return this
  },
  unmount(scope, parentScope) {
    this.update(UNMOUNT_SCOPE, parentScope)

    return this
  },
}

/**
 * Patch the DOM while diffing
 * @param   {any[]} redundant - list of all the children (template, nodes, context) added via each
 * @param   {*} parentScope - scope of the parent template
 * @returns {Function} patch function used by domdiff
 */
function patch(redundant, parentScope) {
  return (item, info) => {
    if (info < 0) {
      // get the last element added to the childrenMap saved previously
      const element = redundant[redundant.length - 1]

      if (element) {
        // get the nodes and the template in stored in the last child of the childrenMap
        const { template, nodes, context } = element
        // remove the last node (notice <template> tags might have more children nodes)
        nodes.pop()

        // notice that we pass null as last argument because
        // the root node and its children will be removed by domdiff
        if (!nodes.length) {
          // we have cleared all the children nodes and we can unmount this template
          redundant.pop()
          template.unmount(context, parentScope, null)
        }
      }
    }

    return item
  }
}

/**
 * Check whether a template must be filtered from a loop
 * @param   {Function} condition - filter function
 * @param   {Object} context - argument passed to the filter function
 * @returns {boolean} true if this item should be skipped
 */
function mustFilterItem(condition, context) {
  return condition ? !condition(context) : false
}

/**
 * Extend the scope of the looped template
 * @param   {Object} scope - current template scope
 * @param   {Object} options - options
 * @param   {string} options.itemName - key to identify the looped item in the new context
 * @param   {string} options.indexName - key to identify the index of the looped item
 * @param   {number} options.index - current index
 * @param   {*} options.item - collection item looped
 * @returns {Object} enhanced scope object
 */
function extendScope(scope, { itemName, indexName, index, item }) {
  defineProperty(scope, itemName, item)
  if (indexName) defineProperty(scope, indexName, index)

  return scope
}

/**
 * Loop the current template items
 * @param   {Array} items - expression collection value
 * @param   {*} scope - template scope
 * @param   {*} parentScope - scope of the parent template
 * @param   {EachBinding} binding - each binding object instance
 * @returns {Object} data
 * @returns {Map} data.newChildrenMap - a Map containing the new children template structure
 * @returns {Array} data.batches - array containing the template lifecycle functions to trigger
 * @returns {Array} data.futureNodes - array containing the nodes we need to diff
 */
function createPatch(items, scope, parentScope, binding) {
  const {
    condition,
    template,
    childrenMap,
    itemName,
    getKey,
    indexName,
    root,
    isTemplateTag,
  } = binding
  const newChildrenMap = new Map()
  const batches = []
  const futureNodes = []

  items.forEach((item, index) => {
    const context = extendScope(Object.create(scope), {
      itemName,
      indexName,
      index,
      item,
    })
    const key = getKey ? getKey(context) : index
    const oldItem = childrenMap.get(key)
    const nodes = []

    if (mustFilterItem(condition, context)) {
      return
    }

    const mustMount = !oldItem
    const componentTemplate = oldItem ? oldItem.template : template.clone()
    const el = componentTemplate.el || root.cloneNode()
    const meta =
      isTemplateTag && mustMount
        ? createTemplateMeta(componentTemplate)
        : componentTemplate.meta

    if (mustMount) {
      batches.push(() =>
        componentTemplate.mount(el, context, parentScope, meta),
      )
    } else {
      batches.push(() => componentTemplate.update(context, parentScope))
    }

    // create the collection of nodes to update or to add
    // in case of template tags we need to add all its children nodes
    if (isTemplateTag) {
      nodes.push(...meta.children)
    } else {
      nodes.push(el)
    }

    // delete the old item from the children map
    childrenMap.delete(key)
    futureNodes.push(...nodes)

    // update the children map
    newChildrenMap.set(key, {
      nodes,
      template: componentTemplate,
      context,
      index,
    })
  })

  return {
    newChildrenMap,
    batches,
    futureNodes,
  }
}

function create$6(
  node,
  { evaluate, condition, itemName, indexName, getKey, template },
) {
  const placeholder = document.createTextNode('')
  const root = node.cloneNode()

  insertBefore(placeholder, node)
  removeChild(node)

  return {
    ...EachBinding,
    childrenMap: new Map(),
    node,
    root,
    condition,
    evaluate,
    isTemplateTag: isTemplate(root),
    template: template.createDOM(node),
    getKey,
    indexName,
    itemName,
    placeholder,
  }
}

/**
 * Binding responsible for the `if` directive
 */
const IfBinding = {
  // dynamic binding properties
  // node: null,
  // evaluate: null,
  // isTemplateTag: false,
  // placeholder: null,
  // template: null,

  // API methods
  mount(scope, parentScope) {
    return this.update(scope, parentScope)
  },
  update(scope, parentScope) {
    const value = !!this.evaluate(scope)
    const mustMount = !this.value && value
    const mustUnmount = this.value && !value
    const mount = () => {
      const pristine = this.node.cloneNode()

      insertBefore(pristine, this.placeholder)
      this.template = this.template.clone()
      this.template.mount(pristine, scope, parentScope)
    }

    switch (true) {
      case mustMount:
        mount()
        break
      case mustUnmount:
        this.unmount(scope)
        break
      default:
        if (value) this.template.update(scope, parentScope)
    }

    this.value = value

    return this
  },
  unmount(scope, parentScope) {
    this.template.unmount(scope, parentScope, true)

    return this
  },
}

function create$5(node, { evaluate, template }) {
  const placeholder = document.createTextNode('')

  insertBefore(placeholder, node)
  removeChild(node)

  return {
    ...IfBinding,
    node,
    evaluate,
    placeholder,
    template: template.createDOM(node),
  }
}

/* c8 ignore next */
const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype
const isNativeHtmlProperty = memoize(
  (name) => ElementProto.hasOwnProperty(name), // eslint-disable-line
)

/**
 * Add all the attributes provided
 * @param   {HTMLElement} node - target node
 * @param   {Object} attributes - object containing the attributes names and values
 * @returns {undefined} sorry it's a void function :(
 */
function setAllAttributes(node, attributes) {
  Object.keys(attributes).forEach((name) =>
    attributeExpression(node, { name }, attributes[name]),
  )
}

/**
 * Remove all the attributes provided
 * @param   {HTMLElement} node - target node
 * @param   {Object} newAttributes - object containing all the new attribute names
 * @param   {Object} oldAttributes - object containing all the old attribute names
 * @returns {undefined} sorry it's a void function :(
 */
function removeAllAttributes(node, newAttributes, oldAttributes) {
  const newKeys = newAttributes ? Object.keys(newAttributes) : []

  Object.keys(oldAttributes)
    .filter((name) => !newKeys.includes(name))
    .forEach((attribute) => node.removeAttribute(attribute))
}

/**
 * Check whether the attribute value can be rendered
 * @param {*} value - expression value
 * @returns {boolean} true if we can render this attribute value
 */
function canRenderAttribute(value) {
  return ['string', 'number', 'boolean'].includes(typeof value)
}

/**
 * Check whether the attribute should be removed
 * @param {*} value - expression value
 * @param   {boolean} isBoolean - flag to handle boolean attributes
 * @returns {boolean} boolean - true if the attribute can be removed}
 */
function shouldRemoveAttribute(value, isBoolean) {
  // boolean attributes should be removed if the value is falsy
  if (isBoolean) return !value && value !== 0
  // otherwise we can try to render it
  return typeof value === 'undefined' || value === null
}

/**
 * This methods handles the DOM attributes updates
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - attribute name
 * @param   {boolean} expression.isBoolean - flag to handle boolean attributes
 * @param   {*} value - new expression value
 * @param   {*} oldValue - the old expression cached value
 * @returns {undefined}
 */
function attributeExpression(
  node,
  { name, isBoolean: isBoolean$1 },
  value,
  oldValue,
) {
  // is it a spread operator? {...attributes}
  if (!name) {
    if (oldValue) {
      // remove all the old attributes
      removeAllAttributes(node, value, oldValue)
    }

    // is the value still truthy?
    if (value) {
      setAllAttributes(node, value)
    }

    return
  }

  // store the attribute on the node to make it compatible with native custom elements
  if (
    !isNativeHtmlProperty(name) &&
    (isBoolean(value) || isObject(value) || isFunction(value))
  ) {
    node[name] = value
  }

  if (shouldRemoveAttribute(value, isBoolean$1)) {
    node.removeAttribute(name)
  } else if (canRenderAttribute(value)) {
    node.setAttribute(name, normalizeValue(name, value, isBoolean$1))
  }
}

/**
 * Get the value as string
 * @param   {string} name - attribute name
 * @param   {*} value - user input value
 * @param   {boolean} isBoolean - boolean attributes flag
 * @returns {string} input value as string
 */
function normalizeValue(name, value, isBoolean) {
  // be sure that expressions like selected={ true } will always be rendered as selected='selected'
  // fix https://github.com/riot/riot/issues/2975
  return value === true && isBoolean ? name : value
}

const RE_EVENTS_PREFIX = /^on/

const getCallbackAndOptions = (value) =>
  Array.isArray(value) ? value : [value, false]

// see also https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38
const EventListener = {
  handleEvent(event) {
    this[event.type](event)
  },
}
const ListenersWeakMap = new WeakMap()

const createListener = (node) => {
  const listener = Object.create(EventListener)
  ListenersWeakMap.set(node, listener)
  return listener
}

/**
 * Set a new event listener
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - event name
 * @param   {*} value - new expression value
 * @returns {value} the callback just received
 */
function eventExpression(node, { name }, value) {
  const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '')
  const eventListener = ListenersWeakMap.get(node) || createListener(node)
  const [callback, options] = getCallbackAndOptions(value)
  const handler = eventListener[normalizedEventName]
  const mustRemoveEvent = handler && !callback
  const mustAddEvent = callback && !handler

  if (mustRemoveEvent) {
    node.removeEventListener(normalizedEventName, eventListener)
  }

  if (mustAddEvent) {
    node.addEventListener(normalizedEventName, eventListener, options)
  }

  eventListener[normalizedEventName] = callback
}

/**
 * Normalize the user value in order to render a empty string in case of falsy values
 * @param   {*} value - user input value
 * @returns {string} hopefully a string
 */
function normalizeStringValue(value) {
  return isNil(value) ? '' : value
}

/**
 * Get the the target text node to update or create one from of a comment node
 * @param   {HTMLElement} node - any html element containing childNodes
 * @param   {number} childNodeIndex - index of the text node in the childNodes list
 * @returns {Text} the text node to update
 */
const getTextNode = (node, childNodeIndex) => {
  return node.childNodes[childNodeIndex]
}

/**
 * This methods handles a simple text expression update
 * @param   {HTMLElement} node - target node
 * @param   {Object} data - expression object
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
function textExpression(node, data, value) {
  node.data = normalizeStringValue(value)
}

/**
 * This methods handles the input fields value updates
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {*} value - new expression value
 * @returns {undefined}
 */
function valueExpression(node, expression, value) {
  node.value = normalizeStringValue(value)
}

const expressions = {
  [ATTRIBUTE]: attributeExpression,
  [EVENT]: eventExpression,
  [TEXT]: textExpression,
  [VALUE]: valueExpression,
}

const Expression = {
  // Static props
  // node: null,
  // value: null,

  // API methods
  /**
   * Mount the expression evaluating its initial value
   * @param   {*} scope - argument passed to the expression to evaluate its current values
   * @returns {Expression} self
   */
  mount(scope) {
    // hopefully a pure function
    this.value = this.evaluate(scope)

    // IO() DOM updates
    apply(this, this.value)

    return this
  },
  /**
   * Update the expression if its value changed
   * @param   {*} scope - argument passed to the expression to evaluate its current values
   * @returns {Expression} self
   */
  update(scope) {
    // pure function
    const value = this.evaluate(scope)

    if (this.value !== value) {
      // IO() DOM updates
      apply(this, value)
      this.value = value
    }

    return this
  },
  /**
   * Expression teardown method
   * @returns {Expression} self
   */
  unmount() {
    // unmount only the event handling expressions
    if (this.type === EVENT) apply(this, null)

    return this
  },
}

/**
 * IO() function to handle the DOM updates
 * @param {Expression} expression - expression object
 * @param {*} value - current expression value
 * @returns {undefined}
 */
function apply(expression, value) {
  return expressions[expression.type](
    expression.node,
    expression,
    value,
    expression.value,
  )
}

function create$4(node, data) {
  return {
    ...Expression,
    ...data,
    node: data.type === TEXT ? getTextNode(node, data.childNodeIndex) : node,
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
        return collection.map((item) => item[method](scope)) && context
      },
    }
  }, {})
}

function create$3(node, { expressions }) {
  return flattenCollectionMethods(
    expressions.map((expression) => create$4(node, expression)),
    ['mount', 'update', 'unmount'],
  )
}

function extendParentScope(attributes, scope, parentScope) {
  if (!attributes || !attributes.length) return parentScope

  const expressions = attributes.map((attr) => ({
    ...attr,
    value: attr.evaluate(scope),
  }))

  return Object.assign(
    Object.create(parentScope || null),
    evaluateAttributeExpressions(expressions),
  )
}

// this function is only meant to fix an edge case
// https://github.com/riot/riot/issues/2842
const getRealParent = (scope, parentScope) =>
  scope[PARENT_KEY_SYMBOL] || parentScope

const SlotBinding = {
  // dynamic binding properties
  // node: null,
  // name: null,
  attributes: [],
  // template: null,

  getTemplateScope(scope, parentScope) {
    return extendParentScope(this.attributes, scope, parentScope)
  },

  // API methods
  mount(scope, parentScope) {
    const templateData = scope.slots
      ? scope.slots.find(({ id }) => id === this.name)
      : false
    const { parentNode } = this.node
    const realParent = getRealParent(scope, parentScope)

    this.template =
      templateData &&
      create(templateData.html, templateData.bindings).createDOM(parentNode)

    if (this.template) {
      cleanNode(this.node)
      this.template.mount(
        this.node,
        this.getTemplateScope(scope, realParent),
        realParent,
      )
      this.template.children = Array.from(this.node.childNodes)
    }

    moveSlotInnerContent(this.node)
    removeChild(this.node)

    return this
  },
  update(scope, parentScope) {
    if (this.template) {
      const realParent = getRealParent(scope, parentScope)
      this.template.update(this.getTemplateScope(scope, realParent), realParent)
    }

    return this
  },
  unmount(scope, parentScope, mustRemoveRoot) {
    if (this.template) {
      this.template.unmount(
        this.getTemplateScope(scope, parentScope),
        null,
        mustRemoveRoot,
      )
    }

    return this
  },
}

/**
 * Move the inner content of the slots outside of them
 * @param   {HTMLElement} slot - slot node
 * @returns {undefined} it's a void method ¯\_(ツ)_/¯
 */
function moveSlotInnerContent(slot) {
  const child = slot && slot.firstChild

  if (!child) return

  insertBefore(child, slot)
  moveSlotInnerContent(slot)
}

/**
 * Create a single slot binding
 * @param   {HTMLElement} node - slot node
 * @param   {string} name - slot id
 * @param   {AttributeExpressionData[]} attributes - slot attributes
 * @returns {Object} Slot binding object
 */
function createSlot(node, { name, attributes }) {
  return {
    ...SlotBinding,
    attributes,
    node,
    name,
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
  return create(slotsToMarkup(slots), [
    ...slotBindings(slots),
    {
      // the attributes should be registered as binding
      // if we fallback to a normal template chunk
      expressions: attributes.map((attr) => {
        return {
          type: ATTRIBUTE,
          ...attr,
        }
      }),
    },
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

const TagBinding = {
  // dynamic binding properties
  // node: null,
  // evaluate: null,
  // name: null,
  // slots: null,
  // tag: null,
  // attributes: null,
  // getComponent: null,

  mount(scope) {
    return this.update(scope)
  },
  update(scope, parentScope) {
    const name = this.evaluate(scope)

    // simple update
    if (name && name === this.name) {
      this.tag.update(scope)
    } else {
      // unmount the old tag if it exists
      this.unmount(scope, parentScope, true)

      // mount the new tag
      this.name = name
      this.tag = getTag(this.getComponent(name), this.slots, this.attributes)
      this.tag.mount(this.node, scope)
    }

    return this
  },
  unmount(scope, parentScope, keepRootTag) {
    if (this.tag) {
      // keep the root tag
      this.tag.unmount(keepRootTag)
    }

    return this
  },
}

function create$2(node, { evaluate, getComponent, slots, attributes }) {
  return {
    ...TagBinding,
    node,
    evaluate,
    slots,
    attributes,
    getComponent,
  }
}

const bindings = {
  [IF]: create$5,
  [SIMPLE]: create$3,
  [EACH]: create$6,
  [TAG]: create$2,
  [SLOT]: createSlot,
}

/**
 * Text expressions in a template tag will get childNodeIndex value normalized
 * depending on the position of the <template> tag offset
 * @param   {Expression[]} expressions - riot expressions array
 * @param   {number} textExpressionsOffset - offset of the <template> tag
 * @returns {Expression[]} expressions containing the text expressions normalized
 */
function fixTextExpressionsOffset(expressions, textExpressionsOffset) {
  return expressions.map((e) =>
    e.type === TEXT
      ? {
          ...e,
          childNodeIndex: e.childNodeIndex + textExpressionsOffset,
        }
      : e,
  )
}

/**
 * Bind a new expression object to a DOM node
 * @param   {HTMLElement} root - DOM node where to bind the expression
 * @param   {TagBindingData} binding - binding data
 * @param   {number|null} templateTagOffset - if it's defined we need to fix the text expressions childNodeIndex offset
 * @returns {Binding} Binding object
 */
function create$1(root, binding, templateTagOffset) {
  const { selector, type, redundantAttribute, expressions } = binding
  // find the node to apply the bindings
  const node = selector ? root.querySelector(selector) : root

  // remove eventually additional attributes created only to select this node
  if (redundantAttribute) node.removeAttribute(redundantAttribute)
  const bindingExpressions = expressions || []

  // init the binding
  return (bindings[type] || bindings[SIMPLE])(node, {
    ...binding,
    expressions:
      templateTagOffset && !selector
        ? fixTextExpressionsOffset(bindingExpressions, templateTagOffset)
        : bindingExpressions,
  })
}

// in this case a simple innerHTML is enough
function createHTMLTree(html, root) {
  const template = isTemplate(root) ? root : document.createElement('template')
  template.innerHTML = html
  return template.content
}

// for svg nodes we need a bit more work
/* c8 ignore start */
function createSVGTree(html, container) {
  // create the SVGNode
  const svgNode = container.ownerDocument.importNode(
    new window.DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`,
      'application/xml',
    ).documentElement,
    true,
  )

  return svgNode
}
/* c8 ignore end */

/**
 * Create the DOM that will be injected
 * @param {Object} root - DOM node to find out the context where the fragment will be created
 * @param   {string} html - DOM to create as string
 * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
 */
function createDOMTree(root, html) {
  /* c8 ignore next */
  if (isSvg(root)) return createSVGTree(html, root)

  return createHTMLTree(html, root)
}

/**
 * Inject the DOM tree into a target node
 * @param   {HTMLElement} el - target element
 * @param   {DocumentFragment|SVGElement} dom - dom tree to inject
 * @returns {undefined}
 */
function injectDOM(el, dom) {
  switch (true) {
    case isSvg(el):
      moveChildren(dom, el)
      break
    case isTemplate(el):
      el.parentNode.replaceChild(dom, el)
      break
    default:
      el.appendChild(dom)
  }
}

/**
 * Create the Template DOM skeleton
 * @param   {HTMLElement} el - root node where the DOM will be injected
 * @param   {string|HTMLElement} html - HTML markup or HTMLElement that will be injected into the root node
 * @returns {?DocumentFragment} fragment that will be injected into the root node
 */
function createTemplateDOM(el, html) {
  return html && (typeof html === 'string' ? createDOMTree(el, html) : html)
}

/**
 * Get the offset of the <template> tag
 * @param {HTMLElement} parentNode - template tag parent node
 * @param {HTMLElement} el - the template tag we want to render
 * @param   {Object} meta - meta properties needed to handle the <template> tags in loops
 * @returns {number} offset of the <template> tag calculated from its siblings DOM nodes
 */
function getTemplateTagOffset(parentNode, el, meta) {
  const siblings = Array.from(parentNode.childNodes)

  return Math.max(siblings.indexOf(el), siblings.indexOf(meta.head) + 1, 0)
}

/**
 * Template Chunk model
 * @type {Object}
 */
const TemplateChunk = {
  // Static props
  // bindings: null,
  // bindingsData: null,
  // html: null,
  // isTemplateTag: false,
  // fragment: null,
  // children: null,
  // dom: null,
  // el: null,

  /**
   * Create the template DOM structure that will be cloned on each mount
   * @param   {HTMLElement} el - the root node
   * @returns {TemplateChunk} self
   */
  createDOM(el) {
    // make sure that the DOM gets created before cloning the template
    this.dom =
      this.dom ||
      createTemplateDOM(el, this.html) ||
      document.createDocumentFragment()

    return this
  },

  // API methods
  /**
   * Attach the template to a DOM node
   * @param   {HTMLElement} el - target DOM node
   * @param   {*} scope - template data
   * @param   {*} parentScope - scope of the parent template tag
   * @param   {Object} meta - meta properties needed to handle the <template> tags in loops
   * @returns {TemplateChunk} self
   */
  mount(el, scope, parentScope, meta = {}) {
    if (!el) panic('Please provide DOM node to mount properly your template')

    if (this.el) this.unmount(scope)

    // <template> tags require a bit more work
    // the template fragment might be already created via meta outside of this call
    const { fragment, children, avoidDOMInjection } = meta
    // <template> bindings of course can not have a root element
    // so we check the parent node to set the query selector bindings
    const { parentNode } = children ? children[0] : el
    const isTemplateTag = isTemplate(el)
    const templateTagOffset = isTemplateTag
      ? getTemplateTagOffset(parentNode, el, meta)
      : null

    // create the DOM if it wasn't created before
    this.createDOM(el)

    // create the DOM of this template cloning the original DOM structure stored in this instance
    // notice that if a documentFragment was passed (via meta) we will use it instead
    const cloneNode = fragment || this.dom.cloneNode(true)

    // store root node
    // notice that for template tags the root note will be the parent tag
    this.el = isTemplateTag ? parentNode : el

    // create the children array only for the <template> fragments
    this.children = isTemplateTag
      ? children || Array.from(cloneNode.childNodes)
      : null

    // inject the DOM into the el only if a fragment is available
    if (!avoidDOMInjection && cloneNode) injectDOM(el, cloneNode)

    // create the bindings
    this.bindings = this.bindingsData.map((binding) =>
      create$1(this.el, binding, templateTagOffset),
    )
    this.bindings.forEach((b) => b.mount(scope, parentScope))

    // store the template meta properties
    this.meta = meta

    return this
  },

  /**
   * Update the template with fresh data
   * @param   {*} scope - template data
   * @param   {*} parentScope - scope of the parent template tag
   * @returns {TemplateChunk} self
   */
  update(scope, parentScope) {
    this.bindings.forEach((b) => b.update(scope, parentScope))

    return this
  },

  /**
   * Remove the template from the node where it was initially mounted
   * @param   {*} scope - template data
   * @param   {*} parentScope - scope of the parent template tag
   * @param   {boolean|null} mustRemoveRoot - if true remove the root element,
   * if false or undefined clean the root tag content, if null don't touch the DOM
   * @returns {TemplateChunk} self
   */
  unmount(scope, parentScope, mustRemoveRoot = false) {
    const el = this.el

    if (!el) {
      return this
    }

    this.bindings.forEach((b) => b.unmount(scope, parentScope, mustRemoveRoot))

    switch (true) {
      // pure components should handle the DOM unmount updates by themselves
      // for mustRemoveRoot === null don't touch the DOM
      case el[IS_PURE_SYMBOL] || mustRemoveRoot === null:
        break

      // if children are declared, clear them
      // applicable for <template> and <slot/> bindings
      case Array.isArray(this.children):
        clearChildren(this.children)
        break

      // clean the node children only
      case !mustRemoveRoot:
        cleanNode(el)
        break

      // remove the root node only if the mustRemoveRoot is truly
      case !!mustRemoveRoot:
        removeChild(el)
        break
    }

    this.el = null

    return this
  },

  /**
   * Clone the template chunk
   * @returns {TemplateChunk} a clone of this object resetting the this.el property
   */
  clone() {
    return {
      ...this,
      meta: {},
      el: null,
    }
  },
}

/**
 * Create a template chunk wiring also the bindings
 * @param   {string|HTMLElement} html - template string
 * @param   {BindingData[]} bindings - bindings collection
 * @returns {TemplateChunk} a new TemplateChunk copy
 */
function create(html, bindings = []) {
  return {
    ...TemplateChunk,
    html,
    bindingsData: bindings,
  }
}

export {
  create$1 as createBinding,
  create$4 as createExpression,
  create as template,
}
