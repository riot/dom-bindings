import globalJsDom from 'jsdom-global'
import { use } from 'chai'
import sinonChai from 'sinon-chai'

use(sinonChai)
globalJsDom()
