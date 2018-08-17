

module.exports = function(suite, testName, domBindings) {
  const tag = domBindings.template('<p expr0><!----></p>', [{
    selector: '[expr0]',
    expressions: [
      { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.text }},
      { type: 'attribute', name: 'class', evaluate(scope) { return scope.class }}
    ]
  }])

  suite
    .on('start', function() {
      // setup
      const simpleTag = document.createElement('div')
      tag.mount(simpleTag, { class: 'foo', text: 'Hello' })
    })
    .on('complete', function() {
      tag.unmount()
    })
    .add(testName, () => {
      tag.update({ isVisible: 'bar', text: 'bye' })
      tag.update({ isVisible: 'foo', text: 's' })
    })

}

