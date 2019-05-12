import { bindingTypes, expressionTypes, template } from '../../src'


describe('slot bindings', () => {
  it('Slots bindings without markup will be removed', () => {
    const target = document.createElement('div')

    const el = template('<article><slot expr0/></article>', [{
      type: bindingTypes.SLOT,
      selector: '[expr0]',
      name: 'default'
    }]).mount(target, {
      text: 'hello'
    })

    expect(target.querySelector('slot')).to.be.not.ok

    expect(() => el.update({ text: 'goodbye' })).to.not.throw()

    el.unmount()
  })

  it('A default slot binding can be properly mounted', () => {
    const target = document.createElement('div')

    const el = template('<article><slot expr0/></article>', [{
      type: bindingTypes.SLOT,
      selector: '[expr0]',
      name: 'default'
    }]).mount(target, {
      slots: [
        {
          id: 'default',
          bindings: [{
            selector: '[expr1]',
            expressions: [{
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: scope => scope.text
            }]
          }],
          html: '<p expr1><!----></p>'
        }
      ]
    }, { text: 'hello' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')

    el.update({}, { text: 'goodbye' })

    expect(p.textContent).to.be.equal('goodbye')

    expect(target.querySelector('slot')).to.be.not.ok
    expect(p).to.be.ok

    el.unmount()
  })

  it('A named slot binding can be properly mounted', () => {
    const target = document.createElement('div')

    const el = template('<article><slot expr0/></article>', [{
      type: bindingTypes.SLOT,
      selector: '[expr0]',
      name: 'foo'
    }]).mount(target, {
      slots: [
        {
          id: 'foo',
          bindings: [{
            selector: '[expr1]',
            expressions: [{
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: scope => scope.text
            }]
          }],
          html: '<p expr1><!----></p>'
        }
      ]
    }, { text: 'hello' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')

    expect(target.querySelector('slot')).to.be.not.ok
    expect(p).to.be.ok

    el.unmount()
  })

  it('If the parent scope wasn\'t received avoid to update the slots', () => {
    const target = document.createElement('div')

    const el = template('<article><slot expr0/></article>', [{
      type: bindingTypes.SLOT,
      selector: '[expr0]',
      name: 'foo'
    }]).mount(target, {
      slots: [
        {
          id: 'foo',
          bindings: [{
            selector: '[expr1]',
            expressions: [{
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: scope => scope.text
            }]
          }],
          html: '<p expr1><!----></p>'
        }
      ]
    }, { text: 'hello' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')

    el.update()

    expect(p.textContent).to.be.equal('hello')
    expect(target.querySelector('slot')).to.be.not.ok
    expect(p).to.be.ok

    el.unmount()
  })
})