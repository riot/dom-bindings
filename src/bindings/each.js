/* WIP */
export const eachBinding = Object.seal({
  // dynamic binding properties
  childrenMap: null,
  node: null,
  root: null,
  condition: null,
  evaluate: null,
  template: null,
  getKey: null,
  tags: [],
  indexName: null,
  itemName: null,
  placeholder: null,

  // API methods
  mount(scope) {
    return this.update(scope)
  },
  update(scope) {
    const { condition, template, childrenMap, itemName, getKey, tags, indexName, root } = this
    const newItems = Array.from(this.evaluate(scope)) || []
    const fragment = document.createDocumentFragment()
    const parent = this.placeholder.parentNode
    const filteredItems = new Set()

    this.tags = newItems.reduce((accumulator, item, i) => {
      // the real item index should be subtracted to the items that were filtered
      const index = i - filteredItems.size
      const context = getContext(itemName, indexName, index, item, scope)
      const key = getKey(context)
      const oldItem = childrenMap.get(key)
      const mustAppend = index >= tags.length

      if (mustFilterItem(condition, oldItem, context)) {
        remove(oldItem.tag, item, childrenMap)
        filteredItems.add(oldItem)
        return accumulator
      }

      if (!oldItem) {
        const tag = template.clone()
        const el = root.cloneNode()

        childrenMap.set(key, {
          tag,
          index
        })

        tag.mount(el, context)

        if (mustAppend) {
          fragment.appendChild(el)
        } else {
          parent.insertBefore(tags[index].el, el)
        }

        return [...accumulator, tag]

      } else if (oldItem.index !== index) {
        const tag = tags[oldItem.index]

        parent.insertBefore(tag.el, tags[index].el)

        childrenMap.set(key, {
          tag,
          index
        })

        tag.update(context)
      } else {
        tags[index].update(context)
      }

      return [...accumulator, oldItem.tag]
    }, [])

    if (tags.length > newItems.length) {
      removeRedundant(tags.length - newItems.length, childrenMap)
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

  parent.insertBefore(placeholder, node)
  parent.removeChild(node)

  return {
    ...eachBinding,
    childrenMap: new Map(),
    node,
    root,
    condition,
    evaluate,
    template,
    getKey,
    indexName,
    itemName,
    placeholder
  }
}