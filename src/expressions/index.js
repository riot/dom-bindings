import {
  ATTRIBUTE,
  EVENT,
  TEXT,
  VALUE,
  REF,
} from '@riotjs/util/expression-types'
import attributeExpression from './attribute.js'
import eventExpression from './event.js'
import textExpression from './text.js'
import valueExpression from './value.js'
import refExpression from './ref.js'

export default {
  [ATTRIBUTE]: attributeExpression,
  [EVENT]: eventExpression,
  [TEXT]: textExpression,
  [VALUE]: valueExpression,
  [REF]: refExpression,
}
