import { cleanNode, clearChildren, removeChild } from '@riotjs/util/dom'
import {IS_PURE_SYMBOL} from '@riotjs/util/constants'
import createBinding from './binding'
import createDOMTree from './util/create-DOM-tree'
import injectDOM from './util/inject-DOM'
import {isTemplate} from '@riotjs/util/checks'

/**
 * Create the Template DOM skeleton
 * @param   {HTMLElement} el - root node where the DOM will be injected
 * @param   {string} html - markup that will be injected into the root node
 * @returns {HTMLFragment} fragment that will be injected into the root node
 */
function createTemplateDOM(el, html) {
  return html && (typeof html === 'string' ?
    createDOMTree(el, html) :
    html)
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
    if (!el) throw new Error('Please provide DOM node to mount properly your template')

    if (this.el) this.unmount(scope)

    const {children, avoidDOMInjection} = meta

    // <template> bindings of course can not have a root element
    // so we check the parent node to set the query selector bindings
    const {parentNode} = children ? children[0] : el
    const isTemplateTag = isTemplate(el)

    // create the DOM if it wasn't created before
    this.createDOM(el)

    // <template> tags require a bit more work
    // the template fragment might be already created via meta outside of this call
    // create the new template dom fragment if it want already passed in via meta
    const fragment = meta.fragment || (this.dom ? this.dom.cloneNode(true) : null)

    this.isTemplateTag = isTemplateTag
    // store root node
    // notice that for template tags the root note will be the parent tag
    this.el = isTemplateTag ? parentNode : el

    // create the children array only for the <template> fragments
    this.children = isTemplateTag && (children || fragment) ? children || Array.from(fragment.childNodes) : null

    // find text expressions offset for <template> fragments
    const templateSiblingNodes = isTemplateTag && Array.from(parentNode.childNodes)
    const templateTagOffset = isTemplateTag && Math.max(
      templateSiblingNodes.indexOf(el),
      templateSiblingNodes.indexOf(meta.head) + 1,
      0
    )

    // inject the DOM into the el only if a fragment is available
    if (!avoidDOMInjection) {
      if (fragment) injectDOM(el, fragment)
      else if (isTemplateTag) el.parentNode.removeChild(el)
    }

    // create the bindings
    this.bindings = this.bindingsData.map(binding => createBinding(
      this.el,
      binding,
      templateTagOffset
    )).filter(binding => binding)
    this.bindings.forEach(b => b.mount(scope, parentScope))

    // store the template meta properties
    this.meta = meta
    this.fragment = fragment

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
   * @param   {*?} parentScope - scope of the parent template tag
   * @param   {boolean|null?} mustRemoveRoot - if true remove the root element,
   * if false or undefined clean the root tag content, if null don't touch the DOM
   * @returns {TemplateChunk} self
   */
  unmount(scope, parentScope, mustRemoveRoot) {
    if (this.el) {
      this.bindings.forEach(b => b.unmount(scope, parentScope, mustRemoveRoot))

      switch (true) {
      // pure components should handle the DOM unmount updates by themselves
      case this.el[IS_PURE_SYMBOL]:
        break
      // <template> tags should be treated a bit differently
      // we need to clear their children only if it's explicitly required by the caller
      // via mustRemoveRoot !== null
      case this.children && mustRemoveRoot !== null:
        clearChildren(this.children)
        break

      // remove the root node only if the mustRemoveRoot === true
      case mustRemoveRoot === true:
        removeChild(this.el)
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
      meta: {},
      el: null
    }
  }
})

/**
 * Create a template chunk wiring also the bindings
 * @param   {string|HTMLElement} html - template string
 * @param   {Array} bindings - bindings collection
 * @returns {TemplateChunk} a new TemplateChunk copy
 */
export default function create(html, bindings = []) {
  return {
    ...TemplateChunk,
    html,
    bindingsData: bindings
  }
}
