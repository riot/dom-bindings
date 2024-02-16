import { bindingTypes, expressionTypes, template } from '../../src/index.js'
import { expect } from 'chai'

function createDummyIfTemplate(options = {}) {
  return template('<div></div><p expr0></p>', [
    {
      selector: '[expr0]',
      type: bindingTypes.IF,
      evaluate: (scope) => scope.isVisible,
      template: template('<b expr0> </b>', [
        {
          selector: '[expr0]',
          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: (scope) => scope.text,
            },
          ],
        },
      ]),
      ...options,
    },
  ])
}

describe('if bindings', () => {
  it('Remove the DOM node from the template if the condition becomes false', () => {
    const target = document.createElement('div')
    const el = createDummyIfTemplate().mount(target, {
      text: 'hello',
      isVisible: true,
    })

    expect(target.querySelector('p')).to.be.ok
    expect(target.querySelector('b').textContent).to.be.equal('hello')
    el.update({ text: 'hello', isVisible: false })

    expect(target.querySelector('p')).to.be.not.ok
    expect(target.querySelector('b')).to.be.not.ok

    el.unmount()
  })

  it('Append the DOM node to the template if the condition becomes true', () => {
    const target = document.createElement('div')
    const el = createDummyIfTemplate().mount(target, {
      text: 'hello',
      isVisible: false,
    })

    expect(target.querySelector('p')).to.be.not.ok
    el.update({ text: 'hello', isVisible: true })
    expect(target.querySelector('p')).to.be.ok
    expect(target.querySelector('b').textContent).to.be.equal('hello')

    el.unmount()
  })

  it('Update nested expressions in an conditional statement', () => {
    const target = document.createElement('div')
    const el = createDummyIfTemplate().mount(target, {
      text: 'hello',
      isVisible: true,
    })

    const b = target.querySelector('b')

    expect(b.textContent).to.be.equal('hello')
    el.update({ text: 'goodbye', isVisible: true })
    expect(b.textContent).to.be.equal('goodbye')

    el.unmount()
  })

  it('Update properly nested nodes', () => {
    const target = document.createElement('div')
    const el = template('<div></div><div expr0></div>', [
      {
        selector: '[expr0]',
        type: bindingTypes.IF,
        evaluate: (scope) => scope.isVisible,
        template: template('<p>hello</p><strong>world</strong>', []),
      },
    ]).mount(target, { isVisible: true })

    expect(target.querySelectorAll('strong')).to.have.length(1)
    el.update({ isVisible: false })
    expect(target.querySelectorAll('strong')).to.have.length(0)
    el.update({ isVisible: true })
    expect(target.querySelectorAll('strong')).to.have.length(1)

    el.unmount()
  })

  it('If bindings should support also truthy values', () => {
    const target = document.createElement('div')
    const el = createDummyIfTemplate().mount(target, {
      text: 'hello',
      isVisible: null,
    })

    expect(target.querySelector('p')).to.be.not.ok

    el.update({ text: 'goodbye', isVisible: [] })

    expect(target.querySelector('p')).to.be.ok

    el.unmount()
  })

  it('Text above <template> tags should be properly rendered', () => {
    const target = document.createElement('div')
    const el = template(
      '<div>hello <template expr1="expr1"></template></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: () => true,
          redundantAttribute: 'expr1',
          selector: '[expr1]',
          template: template(' ', [
            {
              expressions: [
                {
                  type: expressionTypes.TEXT,
                  childNodeIndex: 0,
                  evaluate: () => 'world',
                },
              ],
            },
          ]),
        },
      ],
    ).mount(target, {})

    expect(target.innerHTML).to.be.equal('<div>hello world</div>')
    el.unmount()
  })
})
