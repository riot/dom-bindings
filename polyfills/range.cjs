// HACK: Polyfill needed only for the benchmark
global.window.document.createRange = function createRange() {
  let parent, start, end // eslint-disable-line
  return {
    setEndAfter: (node) => {
      end = node
    },
    setStartBefore: (node) => {
      parent = node.parentNode
      start = node
    },
    deleteContents: () => {
      const children = Array.from(parent.childNodes)
      const offset = children.indexOf(start)
      const endOffset = children.indexOf(end)

      children.slice(offset, endOffset).forEach((node) => {
        parent.removeChild(node)
      })
    },
  }
}
