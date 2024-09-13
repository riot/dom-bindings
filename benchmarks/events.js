function fireEvent(el, name) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(name, false, true)
  el.dispatchEvent(e)
}

export default function (suite, testName, domBindings, rootNode) {
  function generateItems(amount, hasChildren) {
    const items = []
    while (amount--) {
      // eslint-disable-line
      items.push({
        name: `foo ${Math.random()}`,
        props: hasChildren ? generateItems(3, false) : [],
      })
    }
    return items
  }

  const tag = domBindings.template('<ul><li expr0></li></ul>', [
    {
      selector: '[expr0]',
      type: domBindings.bindingTypes.EACH,
      itemName: 'item',
      evaluate(scope) {
        return scope.items
      },
      template: domBindings.template(' <p expr1></p>', [
        {
          expressions: [
            {
              type: domBindings.expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate(scope) {
                return scope.item.name
              },
            },
            {
              type: domBindings.expressionTypes.EVENT,
              name: 'onclick',

              evaluate() {
                return () => 'click'
              },
            },
            {
              type: domBindings.expressionTypes.EVENT,
              name: 'onhover',

              evaluate() {
                return () => 'hover'
              },
            },
          ],
        },
        {
          selector: '[expr1]',
          type: domBindings.bindingTypes.EACH,
          itemName: 'prop',
          evaluate(scope) {
            return scope.item.props
          },
          template: domBindings.template(' ', [
            {
              expressions: [
                {
                  type: domBindings.expressionTypes.TEXT,
                  childNodeIndex: 0,
                  evaluate(scope) {
                    return scope.prop.name
                  },
                },
              ],
            },
          ]),
        },
      ]),
    },
  ])
  suite.add(
    testName,
    function () {
      const items = generateItems(3, true)
      tag.update({ items })
      const beforeLi = rootNode.querySelector('li:nth-child(2)')
      fireEvent(beforeLi, 'click')
      fireEvent(beforeLi, 'hover')
      items.splice(2, 1)
      items.splice(9, 1)
      tag.update({ items: items.concat(generateItems(3, true)) })

      const afterLi = rootNode.querySelector('li:nth-child(2)')
      fireEvent(afterLi, 'click')
      fireEvent(afterLi, 'hover')
    },
    {
      onStart: function () {
        document.body.appendChild(rootNode)
        tag.mount(rootNode, { items: [] })
      },
      onComplete: function () {
        tag.unmount({}, {}, true)
      },
    },
  )
}
