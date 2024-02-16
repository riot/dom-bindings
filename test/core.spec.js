import { bindingTypes, expressionTypes, template } from '../src/index.js'
import { IS_PURE_SYMBOL } from '@riotjs/util/constants'
import { expect } from 'chai'

describe('core specs', () => {
  it('The riot DOM bindings public methods get properly exported', () => {
    expect(template).to.be.ok
  })

  it('The template method creates a valid DOM element', () => {
    const stringTemplate = template('<div></div>').mount(
      document.createElement('div'),
    )
    const DOMTemplate = template(document.createElement('div')).mount(
      document.createElement('div'),
    )

    expect(stringTemplate.dom).to.be.ok
    expect(DOMTemplate.dom).to.be.ok
  })

  it('The template has all the public methods', () => {
    const el = template('hello')
    expect(el).to.respondTo('mount')
    expect(el).to.respondTo('update')
    expect(el).to.respondTo('unmount')
    expect(el).to.respondTo('clone')
  })

  it('The template.mount method throws in case of missing target element', () => {
    const el = template('hello')

    expect(() => el.mount(null)).to.throw(Error)
  })

  it('The template.mount triggered on already mounted element will unmount the previous template', () => {
    const el = template('hello')
    const target = document.createElement('div')

    el.mount(target)
    expect(target.textContent).to.be.equal('hello')

    el.mount(target)
    expect(target.textContent).to.be.equal('hello')
  })

  it('The template.unmount can be able to remove the root node (node not appended to the dom)', () => {
    const el = template('hello')
    const target = document.createElement('div')

    const tag = el.mount(target)

    expect(() => tag.unmount({}, {}, true)).to.not.throw()
  })

  it('The pure components should handle the unmount DOM updates by themselves', () => {
    const el = template('hello')
    const target = document.createElement('div')

    target[IS_PURE_SYMBOL] = true

    document.body.appendChild(target)

    el.mount(target)
    el.unmount({}, {}, true)

    expect(target.parentNode).to.be.ok
    target.parentNode.removeChild(target)
    expect(target.parentNode).to.be.not.ok
  })

  it('The template.unmount can be able to remove the root node (node appended to the dom)', () => {
    const el = template('hello')
    const target = document.createElement('div')

    document.body.appendChild(target)

    const tag = el.mount(target)

    expect(target.parentNode).to.be.ok
    expect(() => tag.unmount({}, {}, true)).to.not.throw()
    expect(target.parentNode).to.be.not.ok
  })

  it('A template can be easily cloned', () => {
    const message = 'hello world'
    const el = template(' ', [
      {
        expressions: [
          {
            type: expressionTypes.TEXT,
            childNodeIndex: 0,
            evaluate: () => message,
          },
        ],
      },
    ])

    const target = document.createElement('div')
    el.clone(target).mount(target)
    expect(target.textContent).to.be.equal(message)
  })

  it('The bindings are properly linked to the DOM nodes', () => {
    const target = document.createElement('div')

    template('<div></div><p expr0> </p>', [
      {
        selector: '[expr0]',
        redundantAttribute: 'expr0',
        expressions: [
          {
            type: expressionTypes.TEXT,
            childNodeIndex: 0,
            evaluate: (scope) => scope.text,
          },
        ],
      },
    ]).mount(target, { text: 'hello' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
    expect(p.hasAttribute('expr0')).to.be.not.ok
  })

  it('Svg fragments could be created properly', () => {
    const target = document.createElement('div')

    template('<div><svg expr0></svg></div>', [
      {
        selector: '[expr0]',
        type: bindingTypes.IF,
        redundantAttribute: 'expr0',
        evaluate: () => true,
        template: template(
          '<image href="some/path.jpg" x="0" y="0" height="100" width="100"/>',
        ),
      },
    ]).mount(target)

    const svg = target.querySelector('svg')

    expect(target.querySelectorAll('svg')).to.have.length(1)
    expect(svg.querySelector('image')).to.be.ok
  })

  it('Template fragments could be created properly with if directives', () => {
    const target = document.createElement('div')

    const el = template('<h1>Title</h1><template expr0/>', [
      {
        selector: '[expr0]',
        type: bindingTypes.IF,
        redundantAttribute: 'expr0',
        evaluate: (scope) => scope.isVisible,
        template: template('<div><p expr0> </p></div>', [
          {
            selector: '[expr0]',
            redundantAttribute: 'expr0',
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
    ]).mount(target, {
      text: 'hello',
      isVisible: true,
    })

    const p = target.querySelector('p')

    expect(target.querySelectorAll('p')).to.have.length(1)
    expect(target.querySelector('template')).to.be.not.ok
    expect(target.querySelector('h1')).to.be.ok
    expect(p.textContent).to.be.equal('hello')

    el.update({
      isVisible: false,
    })

    expect(target.querySelector('p')).to.be.not.ok
    expect(target.querySelector('template')).to.be.not.ok
    expect(target.querySelector('h1')).to.be.ok

    el.unmount()
  })

  it('Template fragments without bindings must stay in the DOM', () => {
    const target = document.createElement('div')

    const el = template('<h1>Title</h1><template>Hello</template>', []).mount(
      target,
      {},
    )

    expect(target.querySelector('template')).to.be.ok
    expect(target.querySelector('template').innerHTML).to.be.equal('Hello')

    el.unmount()
  })

  it('Template fragments can be empty', () => {
    const target = document.createElement('div')

    const el = template(
      '<header></header><template expr1="expr1"></template><footer></footer>',
      [
        {
          type: bindingTypes.IF,
          evaluate: (scope) => scope.isVisible,
          redundantAttribute: 'expr1',
          selector: '[expr1]',
          template: template(null, []),
        },
      ],
    ).mount(target, {
      isVisible: true,
    })

    expect(target.querySelector('header')).to.be.ok
    expect(target.querySelector('template')).to.be.not.ok
    expect(target.querySelector('footer')).to.be.ok

    el.unmount()
  })

  it('Template fragments work also with text nodes', () => {
    const target = document.createElement('div')

    const el = template('<h1>Title</h1><template expr0/>', [
      {
        selector: '[expr0]',
        type: bindingTypes.IF,
        redundantAttribute: 'expr0',
        evaluate: (scope) => scope.isVisible,
        template: template(' ', [
          {
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
    ]).mount(target, {
      text: 'hello',
      isVisible: true,
    })

    expect(target.childNodes).to.have.length(3)
    expect(target.querySelector('template')).to.be.not.ok
    expect(target.querySelector('h1')).to.be.ok
    expect(target.textContent).to.be.equal('Titlehello')

    el.update({
      isVisible: false,
    })

    expect(target.childNodes).to.have.length(2)
    expect(target.querySelector('template')).to.be.not.ok
    expect(target.querySelector('h1')).to.be.ok

    el.unmount()
  })

  it('Template fragments could be created properly with each directives', () => {
    const target = document.createElement('div')

    const el = template('<h1>Title</h1><template expr0/>', [
      {
        selector: '[expr0]',
        type: bindingTypes.EACH,
        itemName: 'val',
        evaluate: (scope) => scope.items,
        template: template('<div><p expr0> </p></div>', [
          {
            selector: '[expr0]',
            redundantAttribute: 'expr0',
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
    ]).mount(target, {
      items: [1, 2],
      text: 'hello',
    })

    expect(target.querySelectorAll('p')).to.have.length(2)
    expect(target.querySelector('template')).to.be.not.ok

    el.update({
      items: [1],
      text: 'goodbye',
    })

    expect(target.querySelectorAll('p')).to.have.length(1)
    expect(target.querySelector('h1')).to.be.ok
    expect(target.querySelector('template')).to.be.not.ok

    el.unmount()
  })

  it('Nested template fragments could be created properly with each directives', () => {
    const target = document.createElement('div')

    const el = template('<h1>Title</h1><template expr0/>', [
      {
        selector: '[expr0]',
        type: bindingTypes.EACH,
        itemName: 'val',
        evaluate: (scope) => scope.items,
        template: template('<h2 expr0> </h2><template expr1>', [
          {
            selector: '[expr0]',
            redundantAttribute: 'expr0',
            expressions: [
              {
                type: expressionTypes.TEXT,
                childNodeIndex: 0,
                evaluate: (scope) => scope.val.text,
              },
            ],
          },
          {
            selector: '[expr1]',
            type: bindingTypes.EACH,
            itemName: 'val',
            evaluate: (scope) => scope.val.children,
            template: template('<h3 expr2> </h3>', [
              {
                selector: '[expr2]',
                redundantAttribute: 'expr2',
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: (scope) => scope.val.text,
                  },
                ],
              },
            ]),
          },
        ]),
      },
    ]).mount(target, {
      items: [
        {
          text: 'foo',
          children: [
            {
              text: 'bar',
            },
          ],
        },
        {
          text: 'buz',
          children: [
            {
              text: 'baz',
            },
          ],
        },
      ],
    })

    expect(target.querySelectorAll('h2')).to.have.length(2)
    expect(target.querySelectorAll('h3')).to.have.length(2)
    expect(target.querySelector('template')).to.be.not.ok

    el.update({
      items: [
        {
          text: 'foo',
        },
        {
          text: 'buz',
          children: [
            {
              text: 'baz',
            },
          ],
        },
      ],
    })

    expect(target.querySelectorAll('h2')).to.have.length(2)
    expect(target.querySelectorAll('h3')).to.have.length(1)
    expect(target.querySelector('template')).to.be.not.ok

    el.unmount()
  })

  it("The content attribute doesn't break the rendering (issue https://github.com/riot/riot/issues/2913)", () => {
    const target = document.createElement('div')

    target.content = true

    const el = template('Hello').mount(target, {})

    expect(target.innerHTML).to.be.equal('Hello')

    el.unmount()
  })
})
