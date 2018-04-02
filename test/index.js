require('jsdom-global')()
global.expect = require('chai').expect

describe('dom-bindings', () => {
  require('./core.specs')
  require('./if.specs')
})