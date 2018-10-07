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

  it('registered tags will receive bindings slots and attributes', (done) => {
    const target = document.createElement('div')

    // fake tag
    registry.set('my-tag', function({ slots, attributes }) {
      expect(slots).to.be.ok
      expect(attributes).to.be.ok

      return {
        mount(el, scope) {
          expect(el).to.be.ok
          expect(scope).to.be.ok
          registry.delete('my-tag')
          done()
        }
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
  })
})