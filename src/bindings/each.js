/* WIP */
export const eachBinding = Object.seal({
  mount(scope) {
    return this.update(scope)
  },
  update(scope) {
    const oldTags = this.tags || []
    const newItems = Array.from(this.evaluate(scope)) || []
    const parent = this.placeholder.parentNode
    const fragment = document.createDocumentFragment()
    const { condition, template, children, itemName, indexName, root } = this

    const newTags = newItems.reduce((accumulator, item, index) => {
      const context = extendScope(itemName, indexName, index, item, scope)
      const oldItem = children.get(item)
      const mustAppend = index >= oldTags.length
      const mustFilter = condition ? condition(context) : false

      if (mustFilter) {
        remove(oldItem.tag, item, children)
        return accumulator
      }

      if (!oldItem) {
        const tag = template.clone()
        const el = root.cloneNode()

        children.set(item, {
          tag,
          index
        })

        tag.mount(el, context)

        if (mustAppend) {
          fragment.appendChild(el)
        } else {
          parent.insertBefore(oldTags[index].el, el)
        }

        return [...accumulator, tag]
      } else if (oldItem.index !== index) {
        const tag = oldTags[oldItem.index]
        parent.insertBefore(oldTags[index].el, tag.el)

        children.set(item, {
          tag,
          index
        })

        tag.update(context)
      } else {
        oldTags[index].update(context)
      }

      return [...accumulator, oldItem.tag]
    }, [])

    if (oldTags.length > newItems.length) {
      removeRedundant(oldTags.length - newItems.length, children)
    }

    parent.insertBefore(fragment, this.placeholder)

    this.tags = newTags

    return this
  },
  unmount() {
    removeRedundant(this.tags.length, this.children)

    return this
  }
})


function removeRedundant(length, children) {
  const entries = Array.from(children.entries())

  return Array(length).fill(null).map(() => {
    const [item, value] = entries[entries.length - 1]
    const { tag } = value
    remove(tag, item, children)
    return item
  })
}

function remove(tag, item, children) {
  tag.unmount(item, true)
  children.delete(item)
}

function extendScope(itemName, indexName, index, item, scope) {
  return Object.assign({}, indexName ? {
    [indexName]: index
  } : null, {
    [itemName]: item
  }, scope)
}

export default function create(node, { evaluate, condition, itemName, indexName, key, template }) {
  const placeholder = document.createTextNode('')
  const parent = node.parentNode
  const root = node.cloneNode()

  parent.insertBefore(placeholder, node)
  parent.removeChild(node)

  return Object.assign({}, eachBinding, {
    children: new Map(),
    node,
    root,
    condition,
    evaluate,
    template,
    key,
    indexName,
    itemName,
    placeholder
  })
}