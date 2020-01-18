import createTemplateMeta from '../util/create-template-meta'
import domdiff from 'domdiff'
import {isTemplate} from '@riotjs/util/checks'
import {removeNode} from '@riotjs/util/dom'

const UNMOUNT_SCOPE = Symbol('unmount')

export const EachBinding = Object.seal({
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
    const parent = placeholder.parentNode

    // prepare the diffing
    const {
      newChildrenMap,
      batches,
      futureNodes
    } = createPatch(items, scope, parentScope, this)

    // patch the DOM only if there are new nodes
    domdiff(parent, nodes, futureNodes, {
      before: placeholder,
      node: patch(
        Array.from(childrenMap.values()),
        parentScope
      )
    })

    // trigger the mounts and the updates
    batches.forEach(fn => fn())

    // update the children map
    this.childrenMap = newChildrenMap
    this.nodes = futureNodes

    return this
  },
  unmount(scope, parentScope) {
    this.update(UNMOUNT_SCOPE, parentScope)

    return this
  }
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
      const element = redundant.pop()
      if (element) {
        const {template, context} = element
        // notice that we pass null as last argument because
        // the root node and its children will be removed by domdiff
        template.unmount(context, parentScope, null)
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
function extendScope(scope, {itemName, indexName, index, item}) {
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
  const { condition, template, childrenMap, itemName, getKey, indexName, root, isTemplateTag } = binding
  const newChildrenMap = new Map()
  const batches = []
  const futureNodes = []

  items.forEach((item, index) => {
    const context = extendScope(Object.create(scope), {itemName, indexName, index, item})
    const key = getKey ? getKey(context) : index
    const oldItem = childrenMap.get(key)

    if (mustFilterItem(condition, context)) {
      return
    }

    const componentTemplate = oldItem ? oldItem.template : template.clone()
    const el = oldItem ? componentTemplate.el : root.cloneNode()
    const mustMount = !oldItem
    const meta = isTemplateTag && mustMount ? createTemplateMeta(componentTemplate) : {}

    if (mustMount) {
      batches.push(() => componentTemplate.mount(el, context, parentScope, meta))
    } else {
      batches.push(() => componentTemplate.update(context, parentScope))
    }

    // create the collection of nodes to update or to add
    // in case of template tags we need to add all its children nodes
    if (isTemplateTag) {
      const children = meta.children || componentTemplate.children
      futureNodes.push(...children)
    } else {
      futureNodes.push(el)
    }

    // delete the old item from the children map
    childrenMap.delete(key)

    // update the children map
    newChildrenMap.set(key, {
      template: componentTemplate,
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

  parent.insertBefore(placeholder, node)
  removeNode(node)

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
    placeholder
  }
}