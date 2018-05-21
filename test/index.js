require('jsdom-global')()

const chai = require('chai')
const sinonChai = require('sinon-chai')

global.sinon = require('sinon')
global.expect = chai.expect

chai.use(sinonChai)

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
    require('./expressions/event.specs')
  })
})