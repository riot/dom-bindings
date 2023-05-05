;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : ((global = global || self), factory((global.riotDOMBindings = {})))
})(this, function (exports) {
  'use strict'

  /**
   * Convert a string from camel case to dash-case
   * @param   {string} string - probably a component tag name
   * @returns {string} component name normalized
   */

  /**
   * Convert a string containing dashes to camel case
   * @param   {string} string - input string
   * @returns {string} my-string -> myString
   */
  function dashToCamelCase(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase())
  }

  /**
   * Move all the child nodes from a source tag to another
   * @param   {HTMLElement} source - source node
   * @param   {HTMLElement} target - target node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */

  // Ignore this helper because it's needed only for svg tags
  function moveChildren(source, target) {
    if (source.firstChild) {
      target.appendChild(source.firstChild)
      moveChildren(source, target)
    }
  }

  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */
  function cleanNode(node) {
    clearChildren(node.childNodes)
  }

  /**
   * Clear multiple children in a node
   * @param   {HTMLElement[]} children - direct children nodes
   * @returns {undefined}
   */
  function clearChildren(children) {
    Array.from(children).forEach(
      (n) => n.parentNode && n.parentNode.removeChild(n),
    )
  }

  const EACH = 0
  const IF = 1
  const SIMPLE = 2
  const TAG = 3
  const SLOT = 4

  var bindingTypes = {
    EACH,
    IF,
    SIMPLE,
    TAG,
    SLOT,
  }

  const ATTRIBUTE = 0
  const EVENT = 1
  const TEXT = 2
  const VALUE = 3

  var expressionTypes = {
    ATTRIBUTE,
    EVENT,
    TEXT,
    VALUE,
  }

  /**
   * Create the template meta object in case of <template> fragments
   * @param   {TemplateChunk} componentTemplate - template chunk object
   * @returns {Object} the meta property that will be passed to the mount function of the TemplateChunk
   */
  function createTemplateMeta(componentTemplate) {
    const fragment = componentTemplate.dom.cloneNode(true)

    return {
      avoidDOMInjection: true,
      fragment,
      children: Array.from(fragment.childNodes),
    }
  }

  const { indexOf: iOF } = []
  const append = (get, parent, children, start, end, before) => {
    const isSelect = 'selectedIndex' in parent
    let noSelection = isSelect
    while (start < end) {
      const child = get(children[start], 1)
      parent.insertBefore(child, before)
      if (isSelect && noSelection && child.selected) {
        noSelection = !noSelection
        let { selectedIndex } = parent
        parent.selectedIndex =
          selectedIndex < 0
            ? start
            : iOF.call(parent.querySelectorAll('option'), child)
      }
      start++
    }
  }

  const eqeq = (a, b) => a == b

  const identity = (O) => O

  const indexOf = (
    moreNodes,
    moreStart,
    moreEnd,
    lessNodes,
    lessStart,
    lessEnd,
    compare,
  ) => {
    const length = lessEnd - lessStart
    /* istanbul ignore if */
    if (length < 1) return -1
    while (moreEnd - moreStart >= length) {
      let m = moreStart
      let l = lessStart
      while (
        m < moreEnd &&
        l < lessEnd &&
        compare(moreNodes[m], lessNodes[l])
      ) {
        m++
        l++
      }
      if (l === lessEnd) return moreStart
      moreStart = m + 1
    }
    return -1
  }

  const isReversed = (
    futureNodes,
    futureEnd,
    currentNodes,
    currentStart,
    currentEnd,
    compare,
  ) => {
    while (
      currentStart < currentEnd &&
      compare(currentNodes[currentStart], futureNodes[futureEnd - 1])
    ) {
      currentStart++
      futureEnd--
    }
    return futureEnd === 0
  }

  const next = (get, list, i, length, before) =>
    i < length
      ? get(list[i], 0)
      : 0 < i
      ? get(list[i - 1], -0).nextSibling
      : before

  const remove = (get, children, start, end) => {
    while (start < end) drop(get(children[start++], -1))
  }

  // - - - - - - - - - - - - - - - - - - -
  // diff related constants and utilities
  // - - - - - - - - - - - - - - - - - - -

  const DELETION = -1
  const INSERTION = 1
  const SKIP = 0
  const SKIP_OND = 50

  const HS = (
    futureNodes,
    futureStart,
    futureEnd,
    futureChanges,
    currentNodes,
    currentStart,
    currentEnd,
    currentChanges,
  ) => {
    let k = 0
    /* istanbul ignore next */
    let minLen = futureChanges < currentChanges ? futureChanges : currentChanges
    const link = Array(minLen++)
    const tresh = Array(minLen)
    tresh[0] = -1

    for (let i = 1; i < minLen; i++) tresh[i] = currentEnd

    const nodes = currentNodes.slice(currentStart, currentEnd)

    for (let i = futureStart; i < futureEnd; i++) {
      const index = nodes.indexOf(futureNodes[i])
      if (-1 < index) {
        const idxInOld = index + currentStart
        k = findK(tresh, minLen, idxInOld)
        /* istanbul ignore else */
        if (-1 < k) {
          tresh[k] = idxInOld
          link[k] = {
            newi: i,
            oldi: idxInOld,
            prev: link[k - 1],
          }
        }
      }
    }

    k = --minLen
    --currentEnd
    while (tresh[k] > currentEnd) --k

    minLen = currentChanges + futureChanges - k
    const diff = Array(minLen)
    let ptr = link[k]
    --futureEnd
    while (ptr) {
      const { newi, oldi } = ptr
      while (futureEnd > newi) {
        diff[--minLen] = INSERTION
        --futureEnd
      }
      while (currentEnd > oldi) {
        diff[--minLen] = DELETION
        --currentEnd
      }
      diff[--minLen] = SKIP
      --futureEnd
      --currentEnd
      ptr = ptr.prev
    }
    while (futureEnd >= futureStart) {
      diff[--minLen] = INSERTION
      --futureEnd
    }
    while (currentEnd >= currentStart) {
      diff[--minLen] = DELETION
      --currentEnd
    }
    return diff
  }

  // this is pretty much the same petit-dom code without the delete map part
  // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L556-L561
  const OND = (
    futureNodes,
    futureStart,
    rows,
    currentNodes,
    currentStart,
    cols,
    compare,
  ) => {
    const length = rows + cols
    const v = []
    let d, k, r, c, pv, cv, pd
    outer: for (d = 0; d <= length; d++) {
      /* istanbul ignore if */
      if (d > SKIP_OND) return null
      pd = d - 1
      /* istanbul ignore next */
      pv = d ? v[d - 1] : [0, 0]
      cv = v[d] = []
      for (k = -d; k <= d; k += 2) {
        if (k === -d || (k !== d && pv[pd + k - 1] < pv[pd + k + 1])) {
          c = pv[pd + k + 1]
        } else {
          c = pv[pd + k - 1] + 1
        }
        r = c - k
        while (
          c < cols &&
          r < rows &&
          compare(currentNodes[currentStart + c], futureNodes[futureStart + r])
        ) {
          c++
          r++
        }
        if (c === cols && r === rows) {
          break outer
        }
        cv[d + k] = c
      }
    }

    const diff = Array(d / 2 + length / 2)
    let diffIdx = diff.length - 1
    for (d = v.length - 1; d >= 0; d--) {
      while (
        c > 0 &&
        r > 0 &&
        compare(
          currentNodes[currentStart + c - 1],
          futureNodes[futureStart + r - 1],
        )
      ) {
        // diagonal edge = equality
        diff[diffIdx--] = SKIP
        c--
        r--
      }
      if (!d) break
      pd = d - 1
      /* istanbul ignore next */
      pv = d ? v[d - 1] : [0, 0]
      k = c - r
      if (k === -d || (k !== d && pv[pd + k - 1] < pv[pd + k + 1])) {
        // vertical edge = insertion
        r--
        diff[diffIdx--] = INSERTION
      } else {
        // horizontal edge = deletion
        c--
        diff[diffIdx--] = DELETION
      }
    }
    return diff
  }

  const applyDiff = (
    diff,
    get,
    parentNode,
    futureNodes,
    futureStart,
    currentNodes,
    currentStart,
    currentLength,
    before,
  ) => {
    const live = []
    const length = diff.length
    let currentIndex = currentStart
    let i = 0
    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          futureStart++
          currentIndex++
          break
        case INSERTION:
          // TODO: bulk appends for sequential nodes
          live.push(futureNodes[futureStart])
          append(
            get,
            parentNode,
            futureNodes,
            futureStart++,
            futureStart,
            currentIndex < currentLength
              ? get(currentNodes[currentIndex], 0)
              : before,
          )
          break
        case DELETION:
          currentIndex++
          break
      }
    }
    i = 0
    while (i < length) {
      switch (diff[i++]) {
        case SKIP:
          currentStart++
          break
        case DELETION:
          // TODO: bulk removes for sequential nodes
          if (-1 < live.indexOf(currentNodes[currentStart])) currentStart++
          else remove(get, currentNodes, currentStart++, currentStart)
          break
      }
    }
  }

  const findK = (ktr, length, j) => {
    let lo = 1
    let hi = length
    while (lo < hi) {
      const mid = ((lo + hi) / 2) >>> 0
      if (j < ktr[mid]) hi = mid
      else lo = mid + 1
    }
    return lo
  }

  const smartDiff = (
    get,
    parentNode,
    futureNodes,
    futureStart,
    futureEnd,
    futureChanges,
    currentNodes,
    currentStart,
    currentEnd,
    currentChanges,
    currentLength,
    compare,
    before,
  ) => {
    applyDiff(
      OND(
        futureNodes,
        futureStart,
        futureChanges,
        currentNodes,
        currentStart,
        currentChanges,
        compare,
      ) ||
        HS(
          futureNodes,
          futureStart,
          futureEnd,
          futureChanges,
          currentNodes,
          currentStart,
          currentEnd,
          currentChanges,
        ),
      get,
      parentNode,
      futureNodes,
      futureStart,
      currentNodes,
      currentStart,
      currentLength,
      before,
    )
  }

  const drop = (node) => (node.remove || dropChild).call(node)

  function dropChild() {
    const { parentNode } = this
    /* istanbul ignore else */
    if (parentNode) parentNode.removeChild(this)
  }

  /*! (c) 2018 Andrea Giammarchi (ISC) */

  const domdiff = (
    parentNode, // where changes happen
    currentNodes, // Array of current items/nodes
    futureNodes, // Array of future items/nodes
    options, // optional object with one of the following properties
    //  before: domNode
    //  compare(generic, generic) => true if same generic
    //  node(generic) => Node
  ) => {
    if (!options) options = {}

    const compare = options.compare || eqeq
    const get = options.node || identity
    const before = options.before == null ? null : get(options.before, 0)

    const currentLength = currentNodes.length
    let currentEnd = currentLength
    let currentStart = 0

    let futureEnd = futureNodes.length
    let futureStart = 0

    // common prefix
    while (
      currentStart < currentEnd &&
      futureStart < futureEnd &&
      compare(currentNodes[currentStart], futureNodes[futureStart])
    ) {
      currentStart++
      futureStart++
    }

    // common suffix
    while (
      currentStart < currentEnd &&
      futureStart < futureEnd &&
      compare(currentNodes[currentEnd - 1], futureNodes[futureEnd - 1])
    ) {
      currentEnd--
      futureEnd--
    }

    const currentSame = currentStart === currentEnd
    const futureSame = futureStart === futureEnd

    // same list
    if (currentSame && futureSame) return futureNodes

    // only stuff to add
    if (currentSame && futureStart < futureEnd) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        next(get, currentNodes, currentStart, currentLength, before),
      )
      return futureNodes
    }

    // only stuff to remove
    if (futureSame && currentStart < currentEnd) {
      remove(get, currentNodes, currentStart, currentEnd)
      return futureNodes
    }

    const currentChanges = currentEnd - currentStart
    const futureChanges = futureEnd - futureStart
    let i = -1

    // 2 simple indels: the shortest sequence is a subsequence of the longest
    if (currentChanges < futureChanges) {
      i = indexOf(
        futureNodes,
        futureStart,
        futureEnd,
        currentNodes,
        currentStart,
        currentEnd,
        compare,
      )
      // inner diff
      if (-1 < i) {
        append(
          get,
          parentNode,
          futureNodes,
          futureStart,
          i,
          get(currentNodes[currentStart], 0),
        )
        append(
          get,
          parentNode,
          futureNodes,
          i + currentChanges,
          futureEnd,
          next(get, currentNodes, currentEnd, currentLength, before),
        )
        return futureNodes
      }
    } else if (futureChanges < currentChanges) {
      /* istanbul ignore else */
      i = indexOf(
        currentNodes,
        currentStart,
        currentEnd,
        futureNodes,
        futureStart,
        futureEnd,
        compare,
      )
      // outer diff
      if (-1 < i) {
        remove(get, currentNodes, currentStart, i)
        remove(get, currentNodes, i + futureChanges, currentEnd)
        return futureNodes
      }
    }

    // common case with one replacement for many nodes
    // or many nodes replaced for a single one
    /* istanbul ignore else */
    if (currentChanges < 2 || futureChanges < 2) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        get(currentNodes[currentStart], 0),
      )
      remove(get, currentNodes, currentStart, currentEnd)
      return futureNodes
    }

    // the half match diff part has been skipped in petit-dom
    // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L391-L397
    // accordingly, I think it's safe to skip in here too
    // if one day it'll come out like the speediest thing ever to do
    // then I might add it in here too

    // Extra: before going too fancy, what about reversed lists ?
    //        This should bail out pretty quickly if that's not the case.
    if (
      currentChanges === futureChanges &&
      isReversed(
        futureNodes,
        futureEnd,
        currentNodes,
        currentStart,
        currentEnd,
        compare,
      )
    ) {
      append(
        get,
        parentNode,
        futureNodes,
        futureStart,
        futureEnd,
        next(get, currentNodes, currentEnd, currentLength, before),
      )
      return futureNodes
    }

    // last resort through a smart diff
    smartDiff(
      get,
      parentNode,
      futureNodes,
      futureStart,
      futureEnd,
      futureChanges,
      currentNodes,
      currentStart,
      currentEnd,
      currentChanges,
      currentLength,
      compare,
      before,
    )

    return futureNodes
  }

  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean} true if the type corresponds
   */
  function checkType(element, type) {
    return typeof element === type
  }

  /**
   * Check if an element is part of an svg
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if we are in an svg context
   */
  function isSvg(el) {
    const owner = el.ownerSVGElement

    return !!owner || owner === null
  }

  /**
   * Check if an element is a template tag
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if it's a <template>
   */
  function isTemplate(el) {
    return !isNil(el.content)
  }

  /**
   * Check if a value is a Boolean
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is a boolean
   */
  function isBoolean(value) {
    return checkType(value, 'boolean')
  }

  /**
   * Check if a value is an Object
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is an object
   */
  function isObject(value) {
    return !isNil(value) && checkType(value, 'object')
  }

  /**
   * Check if a value is null or undefined
   * @param   {*}  value - anything
   * @returns {boolean} true only for the 'undefined' and 'null' types
   */
  function isNil(value) {
    return value === null || value === undefined
  }

  const EachBinding = Object.seal({
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
      const { placeholder } = this
      const collection = this.evaluate(scope)
      const items = collection ? Array.from(collection) : []
      const parent = placeholder.parentNode

      // prepare the diffing
      const { newChildrenMap, batches, futureNodes } = createPatch(
        items,
        scope,
        parentScope,
        this,
      )

      // patch the DOM only if there are new nodes
      if (futureNodes.length) {
        domdiff(parent, this.nodes, futureNodes, {
          before: placeholder,
          node: patch(Array.from(this.childrenMap.values()), parentScope),
        })
      } else {
        // remove all redundant templates
        unmountRedundant(this.childrenMap)
      }

      // trigger the mounts and the updates
      batches.forEach((fn) => fn())

      // update the children map
      this.childrenMap = newChildrenMap
      this.nodes = futureNodes

      return this
    },
    unmount(scope, parentScope) {
      unmountRedundant(this.childrenMap, parentScope)

      this.childrenMap = new Map()
      this.nodes = []

      return this
    },
  })

  /**
   * Patch the DOM while diffing
   * @param   {TemplateChunk[]} redundant - redundant tepmplate chunks
   * @param   {*} parentScope - scope of the parent template
   * @returns {Function} patch function used by domdiff
   */
  function patch(redundant, parentScope) {
    return (item, info) => {
      if (info < 0) {
        const { template, context } = redundant.pop()
        // notice that we pass null as last argument because
        // the root node and its children will be removed by domdiff
        template.unmount(context, parentScope, null)
      }

      return item
    }
  }

  /**
   * Unmount the remaining template instances
   * @param   {Map} childrenMap - map containing the children template to unmount
   * @param   {*} parentScope - scope of the parent template
   * @returns {TemplateChunk[]} collection containing the template chunks unmounted
   */
  function unmountRedundant(childrenMap, parentScope) {
    return Array.from(childrenMap.values()).map(({ template, context }) => {
      return template.unmount(context, parentScope, true)
    })
  }

  /**
   * Check whether a template must be filtered from a loop
   * @param   {Function} condition - filter function
   * @param   {Object} context - argument passed to the filter function
   * @returns {boolean} true if this item should be skipped
   */
  function mustFilterItem(condition, context) {
    return condition ? Boolean(condition(context)) === false : false
  }

  /**
   * Extend the scope of the looped template
   * @param   {Object} scope - current template scope
   * @param   {string} options.itemName - key to identify the looped item in the new context
   * @param   {string} options.indexName - key to identify the index of the looped item
   * @param   {number} options.index - current index
   * @param   {*} options.item - collection item looped
   * @returns {Object} enhanced scope object
   */
  function extendScope(scope, { itemName, indexName, index, item }) {
    scope[itemName] = item
    if (indexName) scope[indexName] = index
    return scope
  }

  /**
   * Loop the current template items
   * @param   {Array} items - expression collection value
   * @param   {*} scope - template scope
   * @param   {*} parentScope - scope of the parent template
   * @param   {EeachBinding} binding - each binding object instance
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

      if (mustFilterItem(condition, context)) {
        return
      }

      const componentTemplate = oldItem ? oldItem.template : template.clone()
      const el = oldItem ? componentTemplate.el : root.cloneNode()
      const mustMount = !oldItem
      const meta =
        isTemplateTag && mustMount ? createTemplateMeta(componentTemplate) : {}

      if (mustMount) {
        batches.push(() =>
          componentTemplate.mount(el, context, parentScope, meta),
        )
      } else {
        componentTemplate.update(context, parentScope)
      }

      // create the collection of nodes to update or to add
      // in case of template tags we need to add all its children nodes
      if (isTemplateTag) {
        futureNodes.push(...(meta.children || componentTemplate.children))
      } else {
        futureNodes.push(el)
      }

      // delete the old item from the children map
      childrenMap.delete(key)

      // update the children map
      newChildrenMap.set(key, {
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

  function create(
    node,
    { evaluate, condition, itemName, indexName, getKey, template },
  ) {
    const placeholder = document.createTextNode('')
    const parent = node.parentNode
    const root = node.cloneNode()

    parent.insertBefore(placeholder, node)
    parent.removeChild(node)

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
  const IfBinding = Object.seal({
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // parent: null,
    // isTemplateTag: false,
    // placeholder: null,
    // template: null,

    // API methods
    mount(scope, parentScope) {
      this.parent.insertBefore(this.placeholder, this.node)
      this.parent.removeChild(this.node)

      return this.update(scope, parentScope)
    },
    update(scope, parentScope) {
      const value = !!this.evaluate(scope)
      const mustMount = !this.value && value
      const mustUnmount = this.value && !value
      const mount = () => {
        const pristine = this.node.cloneNode()

        this.parent.insertBefore(pristine, this.placeholder)

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
  })

  function create$1(node, { evaluate, template }) {
    return {
      ...IfBinding,
      node,
      evaluate,
      parent: node.parentNode,
      placeholder: document.createTextNode(''),
      template: template.createDOM(node),
    }
  }

  const REMOVE_ATTRIBUTE = 'removeAttribute'
  const SET_ATTIBUTE = 'setAttribute'

  /**
   * Add all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing the attributes names and values
   * @returns {undefined} sorry it's a void function :(
   */
  function setAllAttributes(node, attributes) {
    Object.entries(attributes).forEach(([name, value]) =>
      attributeExpression(node, { name }, value),
    )
  }

  /**
   * Remove all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing all the attribute names
   * @returns {undefined} sorry it's a void function :(
   */
  function removeAllAttributes(node, attributes) {
    Object.keys(attributes).forEach((attribute) =>
      node.removeAttribute(attribute),
    )
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
        setAllAttributes(node, value)
      } else if (oldValue) {
        // otherwise remove all the old attributes
        removeAllAttributes(node, oldValue)
      }

      return
    }

    // handle boolean attributes
    if (isBoolean(value) || isObject(value)) {
      node[name] = value
    }

    node[getMethod(value)](name, normalizeValue(name, value))
  }

  /**
   * Get the attribute modifier method
   * @param   {*} value - if truthy we return `setAttribute` othewise `removeAttribute`
   * @returns {string} the node attribute modifier method name
   */
  function getMethod(value) {
    return isNil(value) || value === false || value === '' || isObject(value)
      ? REMOVE_ATTRIBUTE
      : SET_ATTIBUTE
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

  const RE_EVENTS_PREFIX = /^on/

  /**
   * Set a new event listener
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - event name
   * @param   {*} value - new expression value
   * @param   {*} oldValue - old expression value
   * @returns {value} the callback just received
   */
  function eventExpression(node, { name }, value, oldValue) {
    const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '')

    if (oldValue) {
      node.removeEventListener(normalizedEventName, oldValue)
    }

    if (value) {
      node.addEventListener(normalizedEventName, value, false)
    }
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
   * @returns {HTMLTextNode} the text node to update
   */
  const getTextNode = (node, childNodeIndex) => {
    const target = node.childNodes[childNodeIndex]

    if (target.nodeType === Node.COMMENT_NODE) {
      const textNode = document.createTextNode('')
      node.replaceChild(textNode, target)

      return textNode
    }

    return target
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
   * This methods handles the input fileds value updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */
  function valueExpression(node, expression, value) {
    node.value = normalizeStringValue(value)
  }

  var expressions = {
    [ATTRIBUTE]: attributeExpression,
    [EVENT]: eventExpression,
    [TEXT]: textExpression,
    [VALUE]: valueExpression,
  }

  const Expression = Object.seal({
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
  })

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

  function create$2(node, data) {
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
    return {
      ...flattenCollectionMethods(
        expressions.map((expression) => create$2(node, expression)),
        ['mount', 'update', 'unmount'],
      ),
    }
  }

  /**
   * Evaluate a list of attribute expressions
   * @param   {Array} attributes - attribute expressions generated by the riot compiler
   * @returns {Object} key value pairs with the result of the computation
   */
  function evaluateAttributeExpressions(attributes) {
    return attributes.reduce((acc, attribute) => {
      const { value, type } = attribute

      switch (true) {
        // spread attribute
        case !attribute.name && type === ATTRIBUTE:
          return {
            ...acc,
            ...value,
          }
        // value attribute
        case type === VALUE:
          acc.value = attribute.value
          break
        // normal attributes
        default:
          acc[dashToCamelCase(attribute.name)] = attribute.value
      }

      return acc
    }, {})
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

  const SlotBinding = Object.seal({
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

      this.template =
        templateData &&
        create$6(templateData.html, templateData.bindings).createDOM(parentNode)

      if (this.template) {
        this.template.mount(
          this.node,
          this.getTemplateScope(scope, parentScope),
        )
        this.template.children = moveSlotInnerContent(this.node)
      }

      parentNode.removeChild(this.node)

      return this
    },
    update(scope, parentScope) {
      if (this.template) {
        this.template.update(this.getTemplateScope(scope, parentScope))
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
  })

  /**
   * Move the inner content of the slots outside of them
   * @param   {HTMLNode} slot - slot node
   * @param   {HTMLElement} children - array to fill with the child nodes detected
   * @returns {HTMLElement[]} list of the node moved
   */
  function moveSlotInnerContent(slot, children = []) {
    const child = slot.firstChild
    if (child) {
      slot.parentNode.insertBefore(child, slot)
      return [child, ...moveSlotInnerContent(slot)]
    }

    return children
  }

  /**
   * Create a single slot binding
   * @param   {HTMLElement} node - slot node
   * @param   {string} options.name - slot id
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
    return create$6(slotsToMarkup(slots), [
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

  const TagBinding = Object.seal({
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
      if (name === this.name) {
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
  })

  function create$4(node, { evaluate, getComponent, slots, attributes }) {
    return {
      ...TagBinding,
      node,
      evaluate,
      slots,
      attributes,
      getComponent,
    }
  }

  var bindings = {
    [IF]: create$1,
    [SIMPLE]: create$3,
    [EACH]: create,
    [TAG]: create$4,
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
   * @param   {Object} binding - binding data
   * @param   {number|null} templateTagOffset - if it's defined we need to fix the text expressions childNodeIndex offset
   * @returns {Expression} Expression object
   */
  function create$5(root, binding, templateTagOffset) {
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
    const template = isTemplate(root)
      ? root
      : document.createElement('template')
    template.innerHTML = html
    return template.content
  }

  // for svg nodes we need a bit more work
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

  /**
   * Create the DOM that will be injected
   * @param {Object} root - DOM node to find out the context where the fragment will be created
   * @param   {string} html - DOM to create as string
   * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
   */
  function createDOMTree(root, html) {
    if (isSvg(root)) return createSVGTree(html, root)

    return createHTMLTree(html, root)
  }

  /**
   * Inject the DOM tree into a target node
   * @param   {HTMLElement} el - target element
   * @param   {HTMLFragment|SVGElement} dom - dom tree to inject
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
   * @param   {string} html - markup that will be injected into the root node
   * @returns {HTMLFragment} fragment that will be injected into the root node
   */
  function createTemplateDOM(el, html) {
    return html && (typeof html === 'string' ? createDOMTree(el, html) : html)
  }

  /**
   * Template Chunk model
   * @type {Object}
   */
  const TemplateChunk = Object.freeze({
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
      this.dom = this.dom || createTemplateDOM(el, this.html)

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
      if (!el)
        throw new Error(
          'Please provide DOM node to mount properly your template',
        )

      if (this.el) this.unmount(scope)

      // <template> tags require a bit more work
      // the template fragment might be already created via meta outside of this call
      const { fragment, children, avoidDOMInjection } = meta
      // <template> bindings of course can not have a root element
      // so we check the parent node to set the query selector bindings
      const { parentNode } = children ? children[0] : el
      const isTemplateTag = isTemplate(el)
      const templateTagOffset = isTemplateTag
        ? Math.max(Array.from(parentNode.children).indexOf(el), 0)
        : null
      this.isTemplateTag = isTemplateTag

      // create the DOM if it wasn't created before
      this.createDOM(el)

      if (this.dom) {
        // create the new template dom fragment if it want already passed in via meta
        this.fragment = fragment || this.dom.cloneNode(true)
      }

      // store root node
      // notice that for template tags the root note will be the parent tag
      this.el = this.isTemplateTag ? parentNode : el
      // create the children array only for the <template> fragments
      this.children = this.isTemplateTag
        ? children || Array.from(this.fragment.childNodes)
        : null

      // inject the DOM into the el only if a fragment is available
      if (!avoidDOMInjection && this.fragment) injectDOM(el, this.fragment)

      // create the bindings
      this.bindings = this.bindingsData.map((binding) =>
        create$5(this.el, binding, templateTagOffset),
      )
      this.bindings.forEach((b) => b.mount(scope, parentScope))

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
    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.el) {
        this.bindings.forEach((b) =>
          b.unmount(scope, parentScope, mustRemoveRoot),
        )

        switch (true) {
          // <template> tags should be treated a bit differently
          // we need to clear their children only if it's explicitly required by the caller
          // via mustRemoveRoot !== null
          case this.children && mustRemoveRoot !== null:
            clearChildren(this.children)
            break

          // remove the root node only if the mustRemoveRoot === true
          case mustRemoveRoot === true && this.el.parentNode !== null:
            this.el.parentNode.removeChild(this.el)
            break

          // otherwise we clean the node children
          case mustRemoveRoot !== null:
            cleanNode(this.el)
            break
        }

        this.el = null
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
        el: null,
      }
    },
  })

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
      bindingsData: bindings,
    }
  }

  exports.bindingTypes = bindingTypes
  exports.createBinding = create$5
  exports.createExpression = create$2
  exports.expressionTypes = expressionTypes
  exports.template = create$6

  Object.defineProperty(exports, '__esModule', { value: true })
})
