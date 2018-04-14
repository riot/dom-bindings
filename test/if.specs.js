const { template } = require('../')

describe('if specs', () => {
  it('Remove the DOM node from the template if the condition is false', () => {
    const target = document.createElement('div')
    const el = template('<div></div><p expr0></p>', [{
      selector: '[expr0]',
      type: 'if',
      evaluate(scope) { return scope.isVisible },
      template: template('<b expr0><!----></b>', [{
        selector: '[expr0]',
        expressions: [
          { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.text }}
        ]
      }])
    }])

    el.mount(target, { text: 'hello', isVisible: true })
    expect(target.querySelector('b').textContent).to.be.equal('hello')
    el.update(target, { text: 'hello', isVisible: false })
    expect(target.querySelector('b')).to.be.not.ok
  })
})