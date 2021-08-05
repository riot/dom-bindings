import {ExpressionType, template,} from '../'

template('<p>Hello</p>', [{
  selector: 'p',
  expressions: [{
    childNodeIndex: 0,
    type: ExpressionType.TEXT,
    evaluate: () => 'hello'
  }]
}])
