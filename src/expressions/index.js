import {ATTRIBUTE, EVENT, TEXT, VALUE} from '@riotjs/util/expression-types'
import attributeExpression from './attribute'
import eventExpression from './event'
import textExpression from './text'
import valueExpression from './value'

export default {
  [ATTRIBUTE]: attributeExpression,
  [EVENT]: eventExpression,
  [TEXT]: textExpression,
  [VALUE]: valueExpression
}