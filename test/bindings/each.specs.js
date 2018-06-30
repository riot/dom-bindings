/*const tag = riotDOMBindings.template('<ul><li expr0></li></ul>', [{
  selector: '[expr0]',
  type: 'each',
  itemName: 'val',
  getKey(context) { return context.val },
  evaluate(scope) { return scope.items },
  template: riotDOMBindings.template('<!---->', [{
    expressions: [
      {
        type: 'text',
        childNodeIndex: 0,
        evaluate(scope) { return scope.val }
      }
    ]
  }])
}])

const items = [1,2,3]
const el = tag.mount(document.body, {
  items
})

el.update({ items: items.reverse() })*/