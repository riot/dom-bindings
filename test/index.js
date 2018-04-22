require('jsdom-global')()
global.expect = require('chai').expect

describe('dom-bindings', () => {
  require('./core.specs')

  describe('bindings', () => {
    require('./bindings/if.specs')
  })

  describe('expressions', () => {
    require('./expressions/attribute.specs')
  })
})