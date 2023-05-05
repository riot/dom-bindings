export function fireEvent(el, name) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(name, false, true)
  el.dispatchEvent(e)
}

export function domNodesToTextArray(target, selector) {
  return Array.from(target.querySelectorAll(selector)).map((n) => n.innerHTML)
}

export function getNextSiblingChild(node) {
  const { nextSibling } = node

  return nextSibling.tagName ? nextSibling : getNextSiblingChild(nextSibling)
}
