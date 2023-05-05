module.exports = function (suite, testName, domBindings) {
  const tag = domBindings.template('<div></div><p expr0></p>', [
    {
      selector: '[expr0]',
      type: domBindings.bindingTypes.IF,
      evaluate(scope) {
        return scope.isVisible
      },
      template: domBindings.template('<b expr0><!----></b>', [
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

  suite
    .on('start', function () {
      // setup
      const ifTag = document.createElement('div')
      tag.mount(ifTag, { isVisible: true, text: 'Hello' })
    })
    .on('complete', function () {
      tag.unmount()
    })
    .add(testName, () => {
      tag.update({ isVisible: false, text: 'Hello' })
      tag.update({ isVisible: true, text: 'Hello' })
    })
}
