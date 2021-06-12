function fireEvent(el, name) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(name, false, true)
  el.dispatchEvent(e)
}

module.exports = function(suite, testName, domBindings) {
  function generateItems(amount, hasChildren) {
    const items = []
    while (amount--) { // eslint-disable-line
      items.push({
        name: `foo ${Math.random()}`,
        props: hasChildren ? generateItems(5, false) : []
      })
    }
    return items
  }

  const tag = domBindings.template('<ul><li expr0></li></ul>', [{
    selector: '[expr0]',
    type: domBindings.bindingTypes.EACH,
    itemName: 'item',
    evaluate(scope) { return scope.items },
    template: domBindings.template('<!----><p expr1></p>', [{
      expressions: [
        {
          type: domBindings.expressionTypes.TEXT,
          childNodeIndex: 0,
          evaluate(scope) { return scope.item.name }
        },
        {
          'type': domBindings.expressionTypes.EVENT,
          'name': 'onclick',

          evaluate() {
            return () => 'click'
          }
        }, {
          'type': domBindings.expressionTypes.EVENT,
          'name': 'onhover',

          evaluate() {
            return () => 'hover'
          }
        }
      ]
    }, {
      selector: '[expr1]',
      type: domBindings.bindingTypes.EACH,
      itemName: 'prop',
      evaluate(scope) { return scope.item.props },
      template: domBindings.template('<!---->', [{
        expressions: [
          {
            type: domBindings.expressionTypes.TEXT,
            childNodeIndex: 0,
            evaluate(scope) { return scope.prop.name }
          }
        ]
      }])
    }])
  }])


  const loopTag = document.createElement('div')

  suite
    .on('start', function() {
      // setup
      tag.mount(loopTag, { items: [] })
    })
    .on('complete', function() {
      tag.unmount()
    })
    .add(testName, () => {
      const items = generateItems(10, true)
      tag.update({ items })
      const beforeLi = loopTag.querySelector('li:nth-child(2)')
      fireEvent(beforeLi, 'click')
      fireEvent(beforeLi, 'hover')
      items.splice(2, 1)
      items.splice(9, 1)
      tag.update({ items: items.concat(generateItems(5, true)) })

      const afterLi = loopTag.querySelector('li:nth-child(2)')
      fireEvent(afterLi, 'click')
      fireEvent(afterLi, 'hover')
    })

}

