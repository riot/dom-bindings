import { bindingTypes, expressionTypes, template } from '../../src'

function createDummyIfTemplate() {
  return template('<div></div><p expr0></p>', [{
    selector: '[expr0]',
    type: bindingTypes.IF,
    evaluate: scope => scope.isVisible,
    template: template('<b expr0><!----></b>', [{
      selector: '[expr0]',
      expressions: [
        {
          type: expressionTypes.TEXT, childNodeIndex: 0,
          evaluate: scope => scope.text
        }
      ]
    }])
  }])
}

describe('if bindings', () => {
  it('Remove the DOM node from the template if the condition is false', () => {
    const target = document.createElement('div')
    const el = createDummyIfTemplate().mount(target, { text: 'hello', isVisible: true })

    expect(target.querySelector('b').textContent).to.be.equal('hello')
    el.update({ text: 'hello', isVisible: false })

    expect(target.querySelector('b')).to.be.not.ok

    el.unmount()
  })

  it('Update nested expressions in an conditional statement', () => {
    const target = document.createElement('div')
    const el = createDummyIfTemplate().mount(target, { text: 'hello', isVisible: true })

    const b = target.querySelector('b')

    expect(b.textContent).to.be.equal('hello')
    el.update({ text: 'goodbye', isVisible: true })
    expect(b.textContent).to.be.equal('goodbye')

    el.unmount()
  })
})