const { template, tag } = require('../')

describe('core specs', () => {
  it('The riot DOM bindings public methods get properly exported', () => {
    expect(template).to.be.ok
    expect(tag).to.be.ok
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

  it('The template method throws in case of missing arguments', () => {
    expect(() => template()).to.throw
  })

  it('The unmount method throws if the template was never mounted before', () => {
    const el = template('hello')
    expect(() => el.unmount()).to.throw
  })

  it('The bindings are properly linked to the DOM nodes', () => {
    const target = document.createElement('div')
    const el = template('<div></div><p expr0><!----></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.text }}
      ]
    }])

    el.mount(target, { text: 'hello' })
    expect(target.querySelector('[expr0]').textContent).to.be.equal('hello')
  })
})