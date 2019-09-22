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

  it('The slots attribute values will be passed to the children scope', () => {
    const target = document.createElement('div')

    const el = template('<article><slot expr0/></article>', [{
      type: bindingTypes.SLOT,
      selector: '[expr0]',
      name: 'default',
      attributes: [{
        name: 'message',
        evaluate: scope => scope.message
      }]
    }]).mount(target, {
      message: 'hello',
      slots: [
        {
          id: 'default',
          bindings: [{
            selector: '[expr1]',
            expressions: [{
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: scope => scope.message
            }]
          }],
          html: '<p expr1><!----></p>'
        }
      ]
    })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')

    el.update({ message: 'goodbye' })

    expect(p.textContent).to.be.equal('goodbye')

    expect(target.querySelector('slot')).to.be.not.ok
    expect(p).to.be.ok

    el.unmount({ message: '' })
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

    el.update({}, {
      text: 'hello'
    })

    expect(p.textContent).to.be.equal('hello')
    expect(target.querySelector('slot')).to.be.not.ok
    expect(p).to.be.ok

    el.unmount()
  })

  it('Nested <slot>s in an if condition receive always the parent scope', () => {
    const target = document.createElement('div')

    const el = template('<article></article>', [{
      selector: 'article',
      type: bindingTypes.IF,
      evaluate: scope => scope.isVisible,
      template: template('<div><slot expr0/></div>', [{
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'default'
      }])
    }]).mount(target, {
      isVisible: false
    })

    expect(target.querySelector('p')).to.be.not.ok

    el.update({ slots: [
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
    ], isVisible: true }, { text: 'hello' })

    expect(target.querySelector('p').textContent).to.be.equal('hello')

    el.update({ isVisible: false })

    expect(target.querySelector('slot')).to.be.not.ok
    expect(target.querySelector('p')).to.be.not.ok

    el.unmount()
  })

  it('Nested <slot>s in an each condition receive always the parent scope', () => {
    const target = document.createElement('div')

    const el = template('<article></article>', [{
      selector: 'article',
      type: bindingTypes.EACH,
      itemName: 'val',
      evaluate: scope => scope.items,
      template: template('<div><slot expr0/></div>', [{
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'default'
      }])
    }]).mount(target, {
      items: []
    })

    expect(target.querySelector('p')).to.be.not.ok

    el.update({ slots: [
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
    ], items: [1] }, { text: 'hello' })

    expect(target.querySelector('p').textContent).to.be.equal('hello')

    el.update({ items: [] })

    expect(target.querySelector('slot')).to.be.not.ok
    expect(target.querySelector('p')).to.be.not.ok

    el.unmount()
  })
})