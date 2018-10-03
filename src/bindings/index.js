import {EACH, IF, SIMPLE, TAG} from './binding-types'
import EachBinding from './each'
import IfBinding from './if'
import SimpleBinding from './simple'
import TagBinding from './tag'

export default {
  [IF]: IfBinding,
  [SIMPLE]: SimpleBinding,
  [EACH]: EachBinding,
  [TAG]: TagBinding
}