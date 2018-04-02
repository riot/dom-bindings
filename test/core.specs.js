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

  it('The template method throws in case of missing arguments', () => {
    expect(() => template()).to.throw
  })
})