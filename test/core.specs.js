import { expressionTypes, registry, template } from '../src'

describe('core specs', () => {
  it('The riot DOM bindings public methods get properly exported', () => {
    expect(template).to.be.ok
    expect(registry).to.be.ok
  })

  it('The template method creates a valid DOM element', () => {
    expect(template('<div></div>').dom).to.be.ok
    expect(template(document.createElement('div')).dom).to.be.ok
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
    el.clone().mount(target)
    expect(target.textContent).to.be.equal(message)
  })

  it('The unmount method throws if the template was never mounted before', () => {
    const el = template('hello')
    expect(() => el.unmount()).to.throw
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
})