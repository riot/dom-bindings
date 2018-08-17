import domdiff from 'domdiff'

export const eachBinding = Object.seal({
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
    const { condition, placeholder, template, childrenMap, itemName, getKey, indexName, root } = this
    const items = Array.from(this.evaluate(scope)) || []
    const parent = placeholder.parentNode
    const filteredItems = new Set()
    const newChildrenMap = new Map()
    const batches = []
    const futureNodes = []

    // diffing
    items.forEach((item, i) => {
      // the real item index should be subtracted to the items that were filtered
      const index = i - filteredItems.size
      const context = getContext({itemName, indexName, index, item, scope})
      const key = getKey ? getKey(context) : index
      const oldItem = childrenMap.get(key)

      if (mustFilterItem(condition, context)) {
        filteredItems.add(oldItem)
        return
      }

      const tag = oldItem ? oldItem.tag : template.clone()
      const el = oldItem ? tag.el : root.cloneNode()

      if (!oldItem) {
        batches.push(() => tag.mount(el, context))
      } else {
        batches.push(() => tag.update(context))
      }

      futureNodes.push(el || tag.el)

      // update the children map
      newChildrenMap.set(key, {
        tag,
        context,
        index
      })
    })

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
 * Check whether a tag must be fildered from a loop
 * @param   {Function} condition - filter function
 * @param   {Object} context - argument passed to the filter function
 * @returns {boolean} true if this item should be skipped
 */
function mustFilterItem(condition, context) {
  return condition ? condition(context) : false
}

/**
 * Get the context of the looped tag
 * @param   {string} options.itemName - key to identify the looped item in the new context
 * @param   {string} options.indexName - key to identify the index of the loope item
 * @param   {number} options.index - current intex
 * @param   {*} options.item - collection item looped
 * @param   {*} options.scope - current parent scope
 * @returns {Object} enhanced scope object
 */
function getContext({itemName, indexName, index, item, scope}) {
  const context = {
    [itemName]: item,
    ...scope
  }

  if (indexName) {
    return {
      [indexName]: index,
      ...context
    }
  }

  return context
}

export default function create(node, { evaluate, condition, itemName, indexName, getKey, template }) {
  const placeholder = document.createTextNode('')
  const parent = node.parentNode
  const root = node.cloneNode()
  const offset = Array.from(parent.childNodes).indexOf(node)

  parent.insertBefore(placeholder, node)
  parent.removeChild(node)

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