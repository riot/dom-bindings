require('jsdom-global')()


const chai = require('chai')
const sinonChai = require('sinon-chai')

global.sinon = require('sinon')
global.expect = chai.expect

chai.use(sinonChai)

describe('dom-bindings', () => {
  require('./core.spec')

  describe('bindings', () => {
    require('./bindings/each.spec')
    require('./bindings/if.spec')
    require('./bindings/simple.spec')
    require('./bindings/tag.spec')
    require('./bindings/slot.spec')
  })

  describe('expressions', () => {
    require('./expressions/text.spec')
    require('./expressions/attribute.spec')
    require('./expressions/value.spec')
    require('./expressions/event.spec')
  })
})