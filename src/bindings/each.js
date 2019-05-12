import domdiff from 'domdiff'

export const EachBinding = Object.seal({
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
  mount(scope, parentScope) {
    return this.update(scope, parentScope)
  },
  update(scope, parentScope) {
    const { placeholder } = this
    const collection = this.evaluate(scope)
    const items = collection ? Array.from(collection) : []
    const parent = placeholder.parentNode

    // prepare the diffing
    const { newChildrenMap, batches, futureNodes } = loopItems(items, scope, parentScope, this)

    /**
     * DOM Updates
     */
    const before = this.tags[this.tags.length - 1]
    domdiff(parent, this.tags, futureNodes, {
      before: before ? before.nextSibling : placeholder.nextSibling
    })

    // trigger the mounts and the updates
    batches.forEach(fn => fn())

    // update the children map
    this.childrenMap = newChildrenMap
    this.tags = futureNodes

    return this
  },
  unmount() {
    Array
      .from(this.childrenMap.values())
      .forEach(({tag, context}) => {
        tag.unmount(context, true)
      })

    this.childrenMap = new Map()
    this.tags = []

    return this
  }
})

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
 * Extend the scope of the looped tag
 * @param   {Object} scope - current template scope
 * @param   {string} options.itemName - key to identify the looped item in the new context
 * @param   {string} options.indexName - key to identify the index of the looped item
 * @param   {number} options.index - current index
 * @param   {*} options.item - collection item looped
 * @returns {Object} enhanced scope object
 */
function extendScope(scope, {itemName, indexName, index, item}) {
  scope[itemName] = item
  if (indexName) scope[indexName] = index
  return scope
}


/**
 * Loop the current tag items
 * @param   { Array } items - tag collection
 * @param   { * } scope - tag scope
 * @param   { * } parentScope - scope of the parent tag
 * @param   { EeachBinding } binding - each binding object instance
 * @returns { Object } data
 * @returns { Map } data.newChildrenMap - a Map containing the new children tags structure
 * @returns { Array } data.batches - array containing functions the tags lifecycle functions to trigger
 * @returns { Array } data.futureNodes - array containing the nodes we need to diff
 */
function loopItems(items, scope, parentScope, binding) {
  const { condition, template, childrenMap, itemName, getKey, indexName, root } = binding
  const filteredItems = new Set()
  const newChildrenMap = new Map()
  const batches = []
  const futureNodes = []

  items.forEach((item, i) => {
    // the real item index should be subtracted to the items that were filtered
    const index = i - filteredItems.size
    const context = extendScope(Object.create(scope), {itemName, indexName, index, item})
    const key = getKey ? getKey(context) : index
    const oldItem = childrenMap.get(key)

    if (mustFilterItem(condition, context)) {
      filteredItems.add(oldItem)
      return
    }

    const tag = oldItem ? oldItem.tag : template.clone()
    const el = oldItem ? tag.el : root.cloneNode()

    if (!oldItem) {
      batches.push(() => tag.mount(el, context, parentScope))
    } else {
      batches.push(() => tag.update(context, parentScope))
    }

    futureNodes.push(el)

    // update the children map
    newChildrenMap.set(key, {
      tag,
      context,
      index
    })
  })

  return {
    newChildrenMap,
    batches,
    futureNodes
  }
}

export default function create(node, { evaluate, condition, itemName, indexName, getKey, template }) {
  const placeholder = document.createTextNode('')
  const parent = node.parentNode
  const root = node.cloneNode()
  const offset = Array.from(parent.childNodes).indexOf(node)

  parent.insertBefore(placeholder, node)
  parent.removeChild(node)

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