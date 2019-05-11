import { bindingTypes, expressionTypes, template } from '../src'

describe('core specs', () => {
  it('The riot DOM bindings public methods get properly exported', () => {
    expect(template).to.be.ok
  })

  it('The template method creates a valid DOM element', () => {
    const stringTemplate = template('<div></div>').mount(document.createElement('div'))
    const DOMTemplate = template(document.createElement('div')).mount(document.createElement('div'))

    expect(stringTemplate.dom).to.be.ok
    expect(DOMTemplate.dom).to.be.ok
  })

  it('The template has all the public methods', () => {
    const el = template('hello')
    expect(el).to.respondTo('mount')
    expect(el).to.respondTo('update')
    expect(el).to.respondTo('unmount')
    expect(el).to.respondTo('clone')
  })

  it('The template.mount method throws in case of missing target element', () => {
    const el = template('hello')

    expect(() => el.mount(null)).to.throw(Error)
  })

  it('The template.mount triggered on already mounted element will unmount the previous template', () => {
    const el = template('hello')
    const target = document.createElement('div')

    el.mount(target)
    expect(target.textContent).to.be.equal('hello')

    el.mount(target)
    expect(target.textContent).to.be.equal('hello')
  })

  it('The template.unmount can be able to remove the root node (node not appended to the dom)', () => {
    const el = template('hello')
    const target = document.createElement('div')

    const tag = el.mount(target)

    expect(() => tag.unmount({}, {}, true)).to.not.throw()
  })

  it('The template.unmount can be able to remove the root node (node appended to the dom)', () => {
    const el = template('hello')
    const target = document.createElement('div')

    document.body.appendChild(target)

    const tag = el.mount(target)

    expect(target.parentNode).to.be.ok
    expect(() => tag.unmount({}, {}, true)).to.not.throw()
    expect(target.parentNode).to.be.not.ok
  })

  it('A template can be easily cloned', () => {
    const message = 'hello world'
    const el = template('<!---->', [{
      expressions: [{
        type: expressionTypes.TEXT,
        childNodeIndex: 0,
        evaluate: () => message
      }]
    }])

    const target = document.createElement('div')
    el.clone(target).mount(target)
    expect(target.textContent).to.be.equal(message)
  })

  it('The bindings are properly linked to the DOM nodes', () => {
    const target = document.createElement('div')

    template('<div></div><p expr0><!----></p>', [{
      selector: '[expr0]',
      redundantAttribute: 'expr0',
      expressions: [
        {
          type: expressionTypes.TEXT,
          childNodeIndex: 0,
          evaluate: scope => scope.text
        }
      ]
    }]).mount(target, { text: 'hello' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
    expect(p.hasAttribute('expr0')).to.be.not.ok
  })

  it('Svg fragments could be created properly', () => {
    const target = document.createElement('div')

    template('<div><svg expr0></svg></div>', [{
      selector: '[expr0]',
      type: bindingTypes.IF,
      redundantAttribute: 'expr0',
      evaluate: () => true,
      template: template('<image href="some/path.jpg" x="0" y="0" height="100" width="100"/>')
    }]).mount(target)

    const svg = target.querySelector('svg')

    expect(target.querySelectorAll('svg')).to.have.length(1)
    expect(svg.querySelector('image')).to.be.ok
  })
})