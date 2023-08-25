import { EACH, IF, SIMPLE, SLOT, TAG } from '@riotjs/util/binding-types'
import EachBinding from './each.js'
import IfBinding from './if.js'
import SimpleBinding from './simple.js'
import SlotBinding from './slot.js'
import TagBinding from './tag.js'

export default {
  [IF]: IfBinding,
  [SIMPLE]: SimpleBinding,
  [EACH]: EachBinding,
  [TAG]: TagBinding,
  [SLOT]: SlotBinding,
}
