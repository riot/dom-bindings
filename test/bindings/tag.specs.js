const { template, tag, registry } = require('../../') // eslint-disable-line

describe('tag bindings', () => {
  it('tags not registered will fallback to default templates', () => {
    const target = document.createElement('div')

    template('<section><div expr0></div></section>', [{
      selector: '[expr0]',
      type: 'tag',
      name: 'my-tag',
      slots: [
        {
          id: 'default',
          html: '<p expr1><!----></p>'
        }
      ],
      bindings: [{
        selector: '[expr1]',
        expressions: [{
          type: 'text',
          childNodeIndex: 0,
          evaluate(scope) {
            return scope.text
          }
        }]
      }]
    }]).mount(target, { text: 'hello' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
    expect(p).to.be.ok
  })

  it('attributes for tags not registered will be converted into expressions', () => {
    const target = document.createElement('div')

    template('<section><b expr0></b></section>', [{
      selector: '[expr0]',
      type: 'tag',
      name: 'my-tag',
      attributes: [{
        evaluate(scope) { return scope.class },
        name: 'class'
      }]
    }]).mount(target, { class: 'hello' })

    const b = target.querySelector('b')

    expect(b.getAttribute('class')).to.be.equal('hello')
    expect(b).to.be.ok
  })
})