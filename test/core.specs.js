const { template, tag } = require('../')

describe('core specs', () => {
  it('The riot DOM bindings public methods get properly exported', () => {
    expect(template).to.be.ok
    expect(tag).to.be.ok
  })
})