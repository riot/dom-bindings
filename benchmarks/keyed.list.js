

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
    type: 'each',
    itemName: 'item',
    getKey(scope) { return scope.item.name },
    evaluate(scope) { return scope.items },
    template: domBindings.template('<!----><p expr1></p>', [{
      expressions: [
        {
          type: 'text',
          childNodeIndex: 0,
          evaluate(scope) { return scope.item.name }
        }
      ]
    }, {
      selector: '[expr1]',
      type: 'each',
      itemName: 'prop',
      getKey(scope) { return scope.prop.name },
      evaluate(scope) { return scope.item.props },
      template: domBindings.template('<!---->', [{
        expressions: [
          {
            type: 'text',
            childNodeIndex: 0,
            evaluate(scope) { return scope.prop.name }
          }
        ]
      }])
    }])
  }])


  suite
    .on('start', function() {
      // setup
      const loopTag = document.createElement('div')
      tag.mount(loopTag, { items: [] })
    })
    .on('complete', function() {
      tag.unmount()
    })
    .add(testName, () => {
      const items = generateItems(10, true)
      tag.update({ items })
      items.splice(2, 1)
      items.splice(4, 1)
      items.splice(6, 1)
      items.splice(9, 1)
      tag.update({ items: items.concat(generateItems(5, true)) })
    })

}

