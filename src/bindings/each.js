/* WIP */
export const eachBinding = Object.seal({
  mount(scope) {
    return this.update(scope)
  },
  update(scope) {
    const newItems = Array.from(this.evaluate(scope)) || []
    const oldItems = this.items || []
    const parent = this.placeholder.parentNode
    const fragment = document.createDocumentFragment()
    const oldTags = this.tags || []
    const { condition, template, children, itemName, indexName, root } = this

    const newTags = newItems.map((item, index) => {
      const context = extendScope(itemName, indexName, index, item, scope)
      const oldItem = children.get(item)
      const mustAppend = index >= oldTags.length
      const mustFilter = condition ? condition(context) : false

      if (mustFilter) {
        if (oldItem) oldItem.tag.unmount()
        return
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

        return tag
      } else if (oldItem.index !== index) {
        const tag = oldTags[oldItem.index]
        parent.insertBefore(oldTags[index].el, tag.el)

        children.set(item, {
          tag,
          index
        })

        oldItems.splice(index, 0, oldItems.splice(oldItems.index, 1)) // eslint-disable-line
        tag.update(context)
      } else {
        oldTags[index].update(context)
      }

      return oldItem.tag
    })

    /* eslint-disable */
    while (oldItems.length > newItems.length) {
      oldTags[oldTags.length - 1].unmount(null , true)
      children.delete(oldItems[oldItems.length - 1])
      oldItems.pop()
    }
    /* eslint-enable */

    parent.insertBefore(fragment, this.placeholder)
    this.tags = newTags
    this.items = newItems

    return this
  },
  unmount() {

    return this
  }
})


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