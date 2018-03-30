const expect = require('chai').expect
const lib = require('./')

describe('dom-bindings', () => {
  it('The riot DOM bindings get properly exported', () => {
    expect(lib).to.be.ok
  })
})