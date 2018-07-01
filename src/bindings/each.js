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
    const newItems = Array.from(this.evaluate(scope)) || []
    const oldTags = this.tags.slice() // eslint-disable-line
    const fragment = document.createDocumentFragment()
    const parent = this.placeholder.parentNode
    const filteredItems = new Set()

    this.tags = []

    newItems.forEach((item, i) => {
      // the real item index should be subtracted to the items that were filtered
      const index = i - filteredItems.size
      const children = parent.children
      const context = getContext(itemName, indexName, index, item, scope)
      const key = getKey(context)
      const oldItem = childrenMap.get(key)
      const mustAppend = index >= oldTags.length
      const child = children[index + offset]
      let tag // eslint-disable-line

      if (mustFilterItem(condition, oldItem, context)) {
        remove(oldItem.tag, item, childrenMap)
        filteredItems.add(oldItem)
        return
      }

      if (!oldItem) {
        tag = template.clone()
        const el = root.cloneNode()

        tag.mount(el, context)

        if (mustAppend) {
          fragment.appendChild(el)
        } else {
          parent.insertBefore(oldTags[index].el, el)
        }
      } else if (oldItem.index !== index) {
        tag = oldTags[oldItem.index]

        childrenMap.set(key, {
          tag,
          index
        })

        tag.update(context)
      } else {
        tag = oldTags[index]
        tag.update(context)
      }

      if (oldItem && child !== tag.el) {
        parent.insertBefore(tag.el, child)
      }

      childrenMap.set(key, {
        tag,
        index
      })

      this.tags.push(tag) // eslint-disable-line
    })

    if (oldTags.length > newItems.length) {
      removeRedundant(oldTags.length - newItems.length, childrenMap)
    }

    parent.insertBefore(fragment, this.placeholder)

    return this
  },
  unmount() {
    removeRedundant(this.tags.length, this.childrenMap)

    return this
  }
})

function removeRedundant(length, childrenMap) {
  const entries = Array.from(childrenMap.entries())

  return Array(length).fill(null).map(() => {
    const [item, value] = entries[entries.length - 1]
    const { tag } = value
    remove(tag, item, childrenMap)
    return item
  })
}

function mustFilterItem(condition, oldItem, context) {
  return !!oldItem && condition ? condition(context) : false
}

function remove(tag, item, childrenMap) {
  tag.unmount(item, true)
  childrenMap.delete(item)
}

function getContext(itemName, indexName, index, item, scope) {
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