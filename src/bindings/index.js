import defaultBinding from './default'
import ifBinding from './if'
import eachBinding from './each'
import tagBinding from './tag'

export default {
  if: ifBinding,
  default: defaultBinding,
  each: eachBinding,
  tag: tagBinding
}