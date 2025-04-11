import { PARENT_KEY_SYMBOL } from '@riotjs/util'
import { bindingTypes, expressionTypes, template } from '../../src/index.js'
import { expect } from 'chai'

describe('slot bindings', () => {
  it('Slots bindings without markup will be removed', () => {
    const target = document.createElement('div')

    const el = template('<article><slot expr0/></article>', [
      {
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'default',
      },
    ]).mount(target, {
      text: 'hello',
    })

    expect(target.querySelector('slot')).to.be.not.ok

    expect(() => el.update({ text: 'goodbye' })).to.not.throw()

    el.unmount()
  })

  it('The slots attribute values will be passed to the children scope', () => {
    const target = document.createElement('div')

    const el = template('<article><slot expr0/></article>', [
      {
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'default',
        attributes: [
          {
            name: 'message',
            evaluate: (scope) => scope.message,
          },
        ],
      },
    ]).mount(target, {
      message: 'hello',
      slots: [
        {
          id: 'default',
          bindings: [
            {
              selector: '[expr1]',
              expressions: [
                {
                  type: expressionTypes.TEXT,
                  childNodeIndex: 0,
                  evaluate: (scope) => scope.message,
                },
              ],
            },
          ],
          html: '<p expr1> </p>',
        },
      ],
    })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')

    el.update({ message: 'goodbye' })

    expect(p.textContent).to.be.equal('goodbye')

    expect(target.querySelector('slot')).to.be.not.ok
    expect(p).to.be.ok

    el.unmount({ message: '' })
  })

  it('A default slot binding can be properly mounted', () => {
    const target = document.createElement('div')

    const el = template('<article><slot expr0/></article>', [
      {
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'default',
      },
    ]).mount(
      target,
      {
        slots: [
          {
            id: 'default',
            bindings: [
              {
                selector: '[expr1]',
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: (scope) => scope.text,
                  },
                ],
              },
            ],
            html: '<p expr1> </p>',
          },
        ],
      },
      { text: 'hello' },
    )

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')

    el.update({}, { text: 'goodbye' })

    expect(p.textContent).to.be.equal('goodbye')

    expect(target.querySelector('slot')).to.be.not.ok
    expect(p).to.be.ok

    el.unmount()
  })

  it('Text Slot in a conditional <template> will be properly mounted and unmounted', () => {
    const target = document.createElement('div')

    const slots = [
      {
        id: 'default',
        bindings: [
          {
            expressions: [
              {
                type: expressionTypes.TEXT,
                childNodeIndex: 0,
                evaluate: (scope) => scope.text,
              },
            ],
          },
        ],
        html: ' ',
      },
    ]

    const el = template('<p><template></template></p>', [
      {
        selector: 'template',
        type: bindingTypes.IF,
        evaluate: (scope) => scope.isVisible,
        template: template('<slot/>', [
          {
            type: bindingTypes.SLOT,
            selector: 'slot',
            name: 'default',
          },
        ]),
      },
    ]).mount(target, {
      slots,
      isVisible: false,
    })

    expect(target.querySelector('p').textContent).to.be.equal('')

    el.update({ slots, isVisible: true }, { text: 'hello' })

    expect(target.querySelector('p').textContent).to.be.equal('hello')

    el.update({ slots, isVisible: false })

    expect(target.querySelector('p').textContent).to.be.equal('')

    el.update({ slots, isVisible: true }, { text: 'hello' })

    expect(target.querySelector('p').textContent).to.be.equal('hello')

    el.unmount()
  })

  it('A named slot binding can be properly mounted', () => {
    const target = document.createElement('div')

    const el = template('<article><slot expr0/></article>', [
      {
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'foo',
      },
    ]).mount(
      target,
      {
        slots: [
          {
            id: 'foo',
            bindings: [
              {
                selector: '[expr1]',
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: (scope) => scope.text,
                  },
                ],
              },
            ],
            html: '<p expr1> </p>',
          },
        ],
      },
      { text: 'hello' },
    )

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')

    expect(target.querySelector('slot')).to.be.not.ok
    expect(p).to.be.ok

    el.unmount()
  })

  it("If the parent scope wasn't received avoid to update the slots", () => {
    const target = document.createElement('div')

    const el = template('<article><slot expr0/></article>', [
      {
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'foo',
      },
    ]).mount(
      target,
      {
        slots: [
          {
            id: 'foo',
            bindings: [
              {
                selector: '[expr1]',
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: (scope) => scope.text,
                  },
                ],
              },
            ],
            html: '<p expr1> </p>',
          },
        ],
      },
      { text: 'hello' },
    )

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')

    el.update(
      {},
      {
        text: 'hello',
      },
    )

    expect(p.textContent).to.be.equal('hello')
    expect(target.querySelector('slot')).to.be.not.ok
    expect(p).to.be.ok

    el.unmount()
  })

  it('Nested <slot>s in an if condition receive always the parent scope', () => {
    const target = document.createElement('div')

    const el = template('<article></article>', [
      {
        selector: 'article',
        type: bindingTypes.IF,
        evaluate: (scope) => scope.isVisible,
        template: template('<div><slot expr0/></div>', [
          {
            type: bindingTypes.SLOT,
            selector: '[expr0]',
            name: 'default',
          },
        ]),
      },
    ]).mount(target, {
      isVisible: false,
    })

    expect(target.querySelector('p')).to.be.not.ok

    el.update(
      {
        slots: [
          {
            id: 'default',
            bindings: [
              {
                selector: '[expr1]',
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: (scope) => scope.text,
                  },
                ],
              },
            ],
            html: '<p expr1> </p>',
          },
        ],
        isVisible: true,
      },
      { text: 'hello' },
    )

    expect(target.querySelector('p').textContent).to.be.equal('hello')

    el.update({ isVisible: false })

    expect(target.querySelector('slot')).to.be.not.ok
    expect(target.querySelector('p')).to.be.not.ok

    el.unmount()
  })

  it('Nested <slot>s in an each condition receive always the parent scope', () => {
    const target = document.createElement('div')

    const el = template('<article></article>', [
      {
        selector: 'article',
        type: bindingTypes.EACH,
        itemName: 'val',
        evaluate: (scope) => scope.items,
        template: template('<div><slot expr0/></div>', [
          {
            type: bindingTypes.SLOT,
            selector: '[expr0]',
            name: 'default',
          },
        ]),
      },
    ]).mount(target, {
      items: [],
    })

    expect(target.querySelector('p')).to.be.not.ok

    el.update(
      {
        slots: [
          {
            id: 'default',
            bindings: [
              {
                selector: '[expr1]',
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: (scope) => scope.text,
                  },
                ],
              },
            ],
            html: '<p expr1> </p>',
          },
        ],
        items: [1],
      },
      { text: 'hello' },
    )

    expect(target.querySelector('p').textContent).to.be.equal('hello')

    el.update({ items: [] })

    expect(target.querySelector('slot')).to.be.not.ok
    expect(target.querySelector('p')).to.be.not.ok

    el.unmount()
  })

  it('Nested if condition works in slots', () => {
    const target = document.createElement('div')
    const el = template('<div><slot expr0/></div>', [
      {
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'default',
      },
    ])
    const defaultSlot = {
      id: 'default',
      html: '<p expr2="expr2"></p>',

      bindings: [
        {
          type: bindingTypes.IF,

          evaluate: function (scope) {
            return scope.isVisible
          },

          redundantAttribute: 'expr2',
          selector: '[expr2]',
          template: template('hello', []),
        },
      ],
    }

    el.mount(
      target,
      {
        slots: [defaultSlot],
      },
      { isVisible: false },
    )

    expect(target.querySelector('p')).to.be.not.ok

    el.update(
      {
        slots: [defaultSlot],
      },
      { isVisible: true },
    )

    expect(target.querySelector('p')).to.be.ok
  })

  it('Slot with default content', () => {
    const target = document.createElement('div')

    const el = template('<div><slot expr0/></div>', [
      {
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'default',
        template: template('<p expr1> </p>', [
          {
            selector: '[expr1]',
            expressions: [
              {
                type: expressionTypes.TEXT,
                childNodeIndex: 0,
                evaluate: (scope) => scope.text,
              },
            ],
          },
        ]),
      },
    ])

    const defaultSlot = {
      id: 'default',
      html: '<p expr2="expr2"></p>',

      bindings: [
        {
          type: bindingTypes.IF,

          evaluate: function (scope) {
            return scope.isVisible
          },

          redundantAttribute: 'expr2',
          selector: '[expr2]',
          template: template('Hello', []),
        },
      ],
    }

    // Empty slots (show default)
    el.mount(
      target,
      {
        slots: [],
        text: 'Default',
      },
      { isVisible: true },
    )

    expect(target.querySelector('p').textContent).to.be.equal('Default')

    // Exist + if={true} slot (show slot)
    el.mount(
      target,
      {
        slots: [defaultSlot],
      },
      { isVisible: true },
    )

    expect(target.querySelector('p').textContent).to.be.equal('Hello')

    // NOTE: not supported yet
    // Exist + if={false} slot (show default)
    // el.update({
    //   slots: [defaultSlot]
    // }, { isVisible: false })
    //
    // expect(target.querySelector('p').textContent).to.be.equal('Default')

    el.unmount()
  })

  it('Multiple Slots with the same fallback slot content', () => {
    const target1 = document.createElement('div')
    const target2 = document.createElement('div')

    const fallbackSlot = template('<p expr1> </p>', [
      {
        selector: '[expr1]',
        expressions: [
          {
            type: expressionTypes.TEXT,
            childNodeIndex: 0,
            evaluate: (scope) => scope.text,
          },
        ],
      },
    ])

    const component1 = template('<div><slot expr0/></div>', [
      {
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'default',
        template: fallbackSlot,
      },
    ]).mount(target1, {
      slots: [],
      text: 'hello',
    })

    const component2 = template('<div><slot expr0/></div>', [
      {
        type: bindingTypes.SLOT,
        selector: '[expr0]',
        name: 'default',
        template: fallbackSlot,
      },
    ]).mount(target2, {
      slots: [],
      text: 'there',
    })

    expect(target1.querySelector('p').textContent).to.be.equal('hello')
    expect(target2.querySelector('p').textContent).to.be.equal('there')

    component1.unmount()
    component2.unmount()
  })

  it('Nested default Slots work also in children components (https://github.com/riot/riot/issues/3055)', () => {
    const target1 = document.createElement('div')

    const parentComponent = template(
      '<button><slot expr0="expr0" name="default"></slot></button>',
      [
        {
          type: bindingTypes.SLOT,
          attributes: [],
          name: 'default',
          template: template('Default Text', []),
          redundantAttribute: 'expr0',
          selector: '[expr0]',
        },
      ],
    )

    const childComponent = template(
      '<my-button expr1="expr1" style="display: inline-block; border: 5px solid orange"></my-button>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: () => {
            return () => parentComponent
          },
          evaluate: () => 'my-button',
          slots: [
            {
              id: 'default',
            },
          ],
          attributes: [],
          redundantAttribute: 'expr1',
          selector: '[expr1]',
        },
      ],
    ).mount(target1, {
      slots: [],
      text: 'hello',
    })

    expect(target1.querySelector('button').textContent).to.be.equal(
      'Default Text',
    )

    childComponent.unmount()
  })

  it('Nested custom Slots work also in children components (https://github.com/riot/riot/issues/3055)', () => {
    const target1 = document.createElement('div')

    const parentComponent = template(
      '<button><slot expr0="expr0" name="default"></slot></button>',
      [
        {
          type: bindingTypes.SLOT,
          attributes: [],
          name: 'default',
          template: template('Default Text', []),
          redundantAttribute: 'expr0',
          selector: '[expr0]',
        },
      ],
    )

    const childComponent = template(
      '<my-button expr1="expr1" style="display: inline-block; border: 5px solid orange"></my-button>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: () => {
            return () => parentComponent
          },
          evaluate: () => 'my-button',
          slots: [
            {
              id: 'default',
            },
          ],
          attributes: [],
          redundantAttribute: 'expr1',
          selector: '[expr1]',
        },
      ],
    ).mount(target1, {
      [PARENT_KEY_SYMBOL]: { message: 'hello' },
      slots: [
        {
          id: 'default',
          bindings: [
            {
              selector: '[expr1]',
              expressions: [
                {
                  type: expressionTypes.TEXT,
                  childNodeIndex: 0,
                  evaluate: (scope) => scope.message,
                },
              ],
            },
          ],
          html: '<p expr1> </p>',
        },
      ],
    })

    expect(target1.querySelector('p').textContent).to.be.equal('hello')

    childComponent.unmount()
  })
})
