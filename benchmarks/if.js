export default function (suite, testName, domBindings, rootNode) {
  const tag = domBindings.template('<div></div><p expr0></p>', [
    {
      selector: '[expr0]',
      type: domBindings.bindingTypes.IF,
      evaluate(scope) {
        return scope.isVisible
      },
      template: domBindings.template('<b expr0> </b>', [
        {
          selector: '[expr0]',
          expressions: [
            {
              type: domBindings.expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate(scope) {
                return scope.text
              },
            },
          ],
        },
      ]),
    },
  ])

  suite.add(
    testName,
    () => {
      tag.update({ isVisible: false, text: 'Hello' })
      tag.update({ isVisible: true, text: 'Hello' })
    },
    {
      onStart: function () {
        document.body.appendChild(rootNode)
        tag.mount(rootNode, {
          isVisible: true,
          text: 'Hello',
        })
      },
      onComplete: function () {
        tag.unmount({}, {}, true)
      },
    },
  )
}
