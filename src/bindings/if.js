import {insertBefore, removeChild} from '@riotjs/util/dom'

/**
 * Binding responsible for the `if` directive
 */
export const IfBinding = {
  // dynamic binding properties
  // node: null,
  // evaluate: null,
  // isTemplateTag: false,
  // placeholder: null,
  // template: null,

  // API methods
  mount(scope, parentScope) {
    return this.update(scope, parentScope)
  },
  update(scope, parentScope) {
    const value = !!this.evaluate(scope)
    const mustMount = !this.value && value
    const mustUnmount = this.value && !value
    const mount = () => {
      const pristine = this.node.cloneNode()

      insertBefore(pristine, this.placeholder)
      this.template = this.template.clone()
      this.template.mount(pristine, scope, parentScope)
    }

    switch (true) {
    case mustMount:
      mount()
      break
    case mustUnmount:
      this.unmount(scope)
      break
    default:
      if (value) this.template.update(scope, parentScope)
    }

    this.value = value

    return this
  },
  unmount(scope, parentScope) {
    this.template.unmount(scope, parentScope, true)

    return this
  }
}

export default function create(node, { evaluate, template }) {
  const placeholder = document.createTextNode('')

  insertBefore(placeholder, node)
  removeChild(node)

  return {
    ...IfBinding,
    node,
    evaluate,
    placeholder,
    template: template.createDOM(node)
  }
}
