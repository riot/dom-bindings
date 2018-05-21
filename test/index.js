require('jsdom-global')()
global.expect = require('chai').expect

describe('dom-bindings', () => {
  require('./core.specs')

  describe('bindings', () => {
    require('./bindings/if.specs')
    require('./bindings/simple.specs')
    require('./bindings/tag.specs')
  })

  describe('expressions', () => {
    require('./expressions/text.specs')
    require('./expressions/attribute.specs')
    require('./expressions/value.specs')
  })
})