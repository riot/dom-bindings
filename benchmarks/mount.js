export default function (suite, testName, domBindings, rootNode) {
  const tag = domBindings.template('<p expr0> </p>', [
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
        {
          type: domBindings.expressionTypes.ATTRIBUTE,
          name: 'class',
          evaluate(scope) {
            return scope.class
          },
        },
      ],
    },
  ])

  suite.add(
    testName,
    () => {
      tag.update({ class: 'bar', text: 'hi there' })
      tag.update({ class: 'foo', text: 's' })
    },

    {
      onStart: function () {
        document.body.appendChild(rootNode)
        tag.mount(rootNode, { class: 'foo', text: 'Hello' })
      },
      onComplete: function () {
        tag.unmount({}, {}, true)
      },
    },
  )
}
