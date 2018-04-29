import createTag from '../tag'

export default function create(node, { name, html, bindings }) {
  const tag = createTag(name, { html, bindings })

  return Object.assign({}, tag, {
    mount(scope) {
      return tag.mount(node, scope)
    }
  })
}