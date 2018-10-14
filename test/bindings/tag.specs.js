import { bindingTypes, expressionTypes, registry, template } from '../../src'

describe('tag bindings', () => {
  it('tags not registered will fallback to default templates', () => {
    const target = document.createElement('div')

    const el = template('<section><div expr0></div></section>', [{
      selector: '[expr0]',
      type: bindingTypes.TAG,
      name: 'my-tag',
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
    }]).mount(target, { text: 'hello' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
    expect(p).to.be.ok

    el.unmount()
  })

  it('attributes for tags not registered will be converted into expressions', () => {
    const target = document.createElement('div')

    const el = template('<section><b expr0></b></section>', [{
      selector: '[expr0]',
      type: bindingTypes.TAG,
      name: 'my-tag',
      attributes: [{
        evaluate: scope => scope.class,
        name: 'class'
      }]
    }]).mount(target, { class: 'hello' })

    const b = target.querySelector('b')

    expect(b.getAttribute('class')).to.be.equal('hello')
    expect(b).to.be.ok

    el.unmount()
  })

  it('registered tags will receive bindings slots and attributes', () => {
    const target = document.createElement('div')
    const spy = sinon.spy()

    // fake tag
    registry.set('my-tag', function({ slots, attributes }) {
      expect(slots).to.be.ok
      expect(attributes).to.be.ok

      return {
        mount(el, scope) {
          expect(el).to.be.ok
          expect(scope).to.be.ok
          spy()
        },
        unmount() {}
      }
    })

    // create a template with a fake custom riot tag in it
    const el = template('<section><b expr0></b></section>', [{
      selector: '[expr0]',
      type: bindingTypes.TAG,
      name: 'my-tag',
      attributes: [{
        evaluate: scope => scope.class,
        name: 'class'
      }]
    }]).mount(target, { class: 'hello' })

    el.unmount()
    expect(spy).to.have.been.calledOnce
    registry.delete('my-tag')
  })

  it('custom tags can be properly mounted in each bindings', () => {
    const target = document.createElement('div')
    const spy = sinon.spy()

    // fake tag
    registry.set('my-tag', function({ slots, attributes }) {
      expect(slots).to.be.ok
      expect(attributes).to.be.ok

      return {
        mount(el, scope) {
          expect(el).to.be.ok
          expect(el.tagName).to.be.equal('LI')
          expect(scope).to.be.ok
          spy()
        },
        unmount() {}
      }
    })

    const el = template('<ul><li expr0></li></ul>', [{
      type: bindingTypes.EACH,
      itemName: 'val',
      selector: '[expr0]',
      evaluate: scope => scope.items,
      template: template(null, [{
        type: bindingTypes.TAG,
        name: 'my-tag'
      }])
    }]).mount(target, { items: [1, 2] })

    el.unmount()
    expect(spy).to.have.been.calledTwice
    registry.delete('my-tag')
  })

  it('custom tags can be properly mounted in if bindings', () => {
    const target = document.createElement('div')
    const spy = sinon.spy()

    // fake tag
    registry.set('my-tag', function({ slots, attributes }) {
      expect(slots).to.be.ok
      expect(attributes).to.be.ok

      return {
        mount(el, scope) {
          expect(el).to.be.ok
          expect(el.tagName).to.be.equal('LI')
          expect(scope).to.be.ok
          spy()
        },
        unmount() {}
      }
    })

    const el = template('<ul><li expr0></li></ul>', [{
      type: bindingTypes.IF,
      selector: '[expr0]',
      evaluate: scope => scope.isVisible,
      template: template(null, [{
        type: bindingTypes.TAG,
        name: 'my-tag'
      }])
    }]).mount(target, { isVisible: true })

    el.unmount()
    expect(spy).to.have.been.calledOnce
    registry.delete('my-tag')
  })
})