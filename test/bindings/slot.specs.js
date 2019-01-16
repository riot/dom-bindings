import { bindingTypes, expressionTypes, template } from '../../src'


describe('slot bindings', () => {
  it('Can mount a default slot', () => {
    const target = document.createElement('div')
    const el = template('<div><slot expr0/></div>', [{
      selector: '[expr0]',
      name: 'default',
      type: bindingTypes.SLOT
    }]).mount(target, {
      text: 'hello',
      slots: [{
        id: 'default',
        html: '<b expr0><!----></b>',
        bindings: [{
          selector: '[expr0]',
          expressions: [
            { type: expressionTypes.TEXT, childNodeIndex: 0, evaluate: scope => scope.text }
          ]
        }]
      }]
    })

    expect(target.querySelector('b').textContent).to.be.equal('hello')

    el.update({ text: 'goodbye' })

    expect(target.querySelector('b').textContent).to.be.equal('goodbye')

    el.unmount()
  })

  it('Slots get removed if the id was not found into the parent scope', () => {
    const target = document.createElement('div')
    const el = template('<div><slot expr0/></div>', [{
      selector: '[expr0]',
      name: 'default',
      type: bindingTypes.SLOT
    }]).mount(target, {
      text: 'hello',
      slots: [{
        id: 'bar',
        html: '<b expr0><!----></b>',
        bindings: [{
          selector: '[expr0]',
          expressions: [
            { type: expressionTypes.TEXT, childNodeIndex: 0, evaluate: scope => scope.text }
          ]
        }]
      }]
    })

    expect(target.querySelector('b')).to.be.not.ok
    expect(target.querySelector('slot')).to.be.not.ok

    el.update({ text: 'goodbye' })

    expect(target.querySelector('slot')).to.be.not.ok

    el.unmount()
  })

  it('Slots get removed if not found into the parent scope', () => {
    const target = document.createElement('div')
    const el = template('<div><slot expr0/></div>', [{
      selector: '[expr0]',
      name: 'default',
      type: bindingTypes.SLOT
    }]).mount(target, {
      text: 'hello'
    })

    expect(target.querySelector('b')).to.be.not.ok
    expect(target.querySelector('slot')).to.be.not.ok

    el.update({ text: 'goodbye' })

    expect(target.querySelector('slot')).to.be.not.ok

    el.unmount()
  })


})