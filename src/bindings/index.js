import {EACH, IF, SIMPLE, SLOT, TAG} from '@riotjs/util/binding-types'
import EachBinding from './each'
import IfBinding from './if'
import SimpleBinding from './simple'
import SlotBinding from './slot'
import TagBinding from './tag'

export default {
  [IF]: IfBinding,
  [SIMPLE]: SimpleBinding,
  [EACH]: EachBinding,
  [TAG]: TagBinding,
  [SLOT]: SlotBinding
}