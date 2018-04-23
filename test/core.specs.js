const { template, tag } = require('../')
const supportsShadowDOMv1 = 'attachShadow' in Element.prototype

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

  it('A template can be easily cloned', () => {
    doCloneTest()
  })

  it('A template can be easily cloned for Shadow DOM', function () {
    if (supportsShadowDOMv1) {
      doCloneTest({ attach: 'shadow' })
    } else {
      this.skip()
    }
  })

  function doCloneTest(options) {
    const message = 'hello world'
    const el = template('<!---->', [{
      expressions: [{
        type: 'text', childNodeIndex: 0, evaluate() { return message }
      }]
    }], options)

    const target = document.createElement('div')
    el.clone().mount(target)
    expect(target.textContent).to.be.equal(message)
  }

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
        { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.text }}
      ]
    }]).mount(target, { text: 'hello' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
    expect(p.hasAttribute('expr0')).to.be.not.ok
  })

  it('can create open shadow-DOM', function () {
    if (supportsShadowDOMv1) {
      const target = document.createElement('div')
      template('<p>hello</p>', [], { attach: 'shadow' }).mount(target)

      expect(target.shadowRoot).to.be.not.null
      const p = target.shadowRoot.querySelector('p')
      expect(p.textContent).to.be.equal('hello')
    } else {
      this.skip()
    }
  })
})