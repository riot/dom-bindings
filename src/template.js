import {cleanNode, clearChildren, removeChild} from '@riotjs/util/dom'
import {IS_PURE_SYMBOL} from '@riotjs/util/constants'
import createBinding from './binding'
import createDOMTree from './util/create-DOM-tree'
import injectDOM from './util/inject-DOM'
import {isTemplate} from '@riotjs/util/checks'

/**
 * Create the Template DOM skeleton
 * @param   {HTMLElement} el - root node where the DOM will be injected
 * @param   {string|HTMLElement} html - HTML markup or HTMLElement that will be injected into the root node
 * @returns {?DocumentFragment} fragment that will be injected into the root node
 */
function createTemplateDOM(el, html) {
  return html && (typeof html === 'string' ?
    createDOMTree(el, html) :
    html)
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

  return Math.max(
    siblings.indexOf(el),
    siblings.indexOf(meta.head) + 1,
    0
  )
}

/**
 * Template Chunk model
 * @type {Object}
 */
export const TemplateChunk = Object.freeze({
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
    this.dom = this.dom || createTemplateDOM(el, this.html) || document.createDocumentFragment()

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
    if (!el) throw new Error('Please provide DOM node to mount properly your template')

    if (this.el) this.unmount(scope)

    // <template> tags require a bit more work
    // the template fragment might be already created via meta outside of this call
    const {fragment, children, avoidDOMInjection} = meta
    // <template> bindings of course can not have a root element
    // so we check the parent node to set the query selector bindings
    const {parentNode} = children ? children[0] : el
    const isTemplateTag = isTemplate(el)
    const templateTagOffset = isTemplateTag ? getTemplateTagOffset(parentNode, el, meta) : null

    // create the DOM if it wasn't created before
    this.createDOM(el)

    // create the DOM of this template cloning the original DOM structure stored in this instance
    // notice that if a documentFragment was passed (via meta) we will use it instead
    const cloneNode = fragment || this.dom.cloneNode(true)

    // store root node
    // notice that for template tags the root note will be the parent tag
    this.el = isTemplateTag ? parentNode : el

    // create the children array only for the <template> fragments
    this.children = isTemplateTag ? children || Array.from(cloneNode.childNodes) : null

    // inject the DOM into the el only if a fragment is available
    if (!avoidDOMInjection && cloneNode) injectDOM(el, cloneNode)

    // create the bindings
    this.bindings = this.bindingsData.map(binding => createBinding(
      this.el,
      binding,
      templateTagOffset
    ))
    this.bindings.forEach(b => b.mount(scope, parentScope))

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
    this.bindings.forEach(b => b.update(scope, parentScope))

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

    this.bindings.forEach(b => b.unmount(scope, parentScope, mustRemoveRoot))

    switch (true) {
    // pure components should handle the DOM unmount updates by themselves
    // for mustRemoveRoot === null don't touch the DOM
    case (el[IS_PURE_SYMBOL] || mustRemoveRoot === null):
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
      el: null
    }
  }
})


/**
 * Create a template chunk wiring also the bindings
 * @param   {string|HTMLElement} html - template string
 * @param   {BindingData[]} bindings - bindings collection
 * @returns {TemplateChunk} a new TemplateChunk copy
 */
export default function create(html, bindings = []) {
  return {
    ...TemplateChunk,
    html,
    bindingsData: bindings
  }
}
