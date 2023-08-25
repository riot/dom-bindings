import { ATTRIBUTE, EVENT, TEXT, VALUE } from '@riotjs/util/expression-types'
import attributeExpression from './attribute.js'
import eventExpression from './event.js'
import textExpression from './text.js'
import valueExpression from './value.js'

export default {
  [ATTRIBUTE]: attributeExpression,
  [EVENT]: eventExpression,
  [TEXT]: textExpression,
  [VALUE]: valueExpression,
}
