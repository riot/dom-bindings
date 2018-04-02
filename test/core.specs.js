const { create, bind } = require('../')

describe('core specs', () => {
  it('The riot DOM bindings get properly exported', () => {
    expect(create).to.be.ok
    expect(bind).to.be.ok
  })
})