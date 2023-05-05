import { BindingType, EachBindingData, ExpressionType, template } from '../'

template('<p>Hello</p>', [
  {
    selector: 'p',
    expressions: [
      {
        childNodeIndex: 0,
        type: ExpressionType.TEXT,
        evaluate: () => 'hello',
      },
    ],
  },
])

template<{ items: string[]; item: string; index: number }>(
  '<ul><li></li></ul>',
  [
    {
      selector: 'li',
      type: BindingType.EACH,
      itemName: 'item',
      indexName: 'index',
      evaluate: (scope) => scope.items,
      condition: (scope) => scope.item === 'a',
      getKey: (scope) => scope.index,
      template: template(` `, [
        {
          expressions: [
            {
              type: ExpressionType.TEXT,
              childNodeIndex: 0,
              evaluate: (scope) => scope.item && scope.index,
            },
          ],
        },
      ]),
    },
  ],
)

template<{ items: string[] }>('<ul><li></li></ul>', [
  {
    selector: 'li',
    type: BindingType.IF,
    evaluate: (scope) => scope.items.length,
    template: template(` `, [
      {
        expressions: [
          {
            type: ExpressionType.TEXT,
            childNodeIndex: 0,
            evaluate: (scope) => scope.items.length,
          },
        ],
      },
    ]),
  },
])
