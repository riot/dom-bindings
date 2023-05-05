import globalJsDom from 'jsdom-global'
import chai from 'chai'
import sinonChai from 'sinon-chai'

chai.use(sinonChai)
globalJsDom()
