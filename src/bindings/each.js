/* WIP */
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
  placeholder: null,

  // API methods
  mount(scope) {
    return this.update(scope)
  },
  update(scope) {
    const { condition, offset, template, childrenMap, itemName, getKey, indexName, root } = this
    const items = Array.from(this.evaluate(scope)) || []
    const redundantTagsMap = tagsLookupFromChildrenMap(this.childrenMap)
    const oldTagsLength = this.childrenMap.size
    const fragment = document.createDocumentFragment()
    const parent = this.placeholder.parentNode
    const filteredItems = new Set()
    const moves = []
    const updates = []

    // diffing
    items.forEach((item, i) => {
      // the real item index should be subtracted to the items that were filtered
      const index = i - filteredItems.size
      const context = getContext({itemName, indexName, index, item, scope})
      const key = getKey(context)
      const oldItem = childrenMap.get(key)

      if (mustFilterItem(condition, context)) {
        filteredItems.add(oldItem)
        return
      }

      const tag = oldItem ? oldItem.tag : template.clone()
      const shouldNodeBeAppended = index >= oldTagsLength
      const shouldNodeBeMoved = oldItem && oldItem.index !== index
      const shuldNodeBeInserted = !oldItem && !shouldNodeBeAppended

      if (!oldItem) {
        const el = root.cloneNode()
        tag.mount(el, context)

        if (shouldNodeBeAppended) {
          fragment.appendChild(el)
        }
      } else {
        updates.push(() => tag.update(context))
      }

      // move or insert the new element
      if (shouldNodeBeMoved || shuldNodeBeInserted) {
        moves.push([tag, index])
      }

      // this tag is not redundant we don't need to remove it
      redundantTagsMap.delete(tag)

      // update the children map
      childrenMap.set(key, {
        tag,
        context,
        index
      })
    })

    /**
     * DOM Updates
     */

    // append the new tags
    parent.insertBefore(fragment, this.placeholder)

    // trigger the mount
    const children = parent.children
    moves.forEach(([tag, index]) => {
      parent.insertBefore(tag.el, children[index + offset])
    })

    // unmount the redundant tags
    if (redundantTagsMap.size) {
      removeRedundant(redundantTagsMap, childrenMap)
    }

    // trigger the updates
    updates.forEach(fn => fn())

    return this
  },
  unmount() {
    removeRedundant(
      tagsLookupFromChildrenMap(this.childrenMap),
      this.childrenMap
    )

    return this
  }
})

/**
 * Unmount the redundant tags removing them from the children map and from DOM
 * @param   {Map<tag, key>} redundantTagsMap - map containing the redundant tags
 * @param   {Map} childrenMap - map containing tags, keys, their context data and their current index
 * @returns {Tag} the tag objects just unmounted
 */
function removeRedundant(redundantTagsMap, childrenMap) {
  return [...redundantTagsMap.entries()].map(([tag, key]) => {
    const { context } = childrenMap.get(key)
    tag.unmount(context, true)
    childrenMap.delete(key)

    return tag
  })
}

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
 * It creates a javascript Map<(tag, key)> from the children map received
 * @param   {Map} childrenMap - map containing tags, keys, their context data and their current index
 * @returns {Map} <tag,key> lookup map
 */
function tagsLookupFromChildrenMap(childrenMap) {
  return [...childrenMap.entries()]
    .reduce((tags, [key, {tag}]) => tags.set(tag, key), new Map())
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
  const offset = Array.from(parent.children).indexOf(node)

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