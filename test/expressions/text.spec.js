import { expressionTypes, template } from '../../src/index.js'
import { expect } from 'chai'

describe('text specs', () => {
  it('set the content of a text node (comment placeholder)', () => {
    const target = document.createElement('div')
    template('<p expr0><----></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.TEXT,
            childNodeIndex: 0,
            evaluate: (scope) => scope.val,
          },
        ],
      },
    ]).mount(target, { val: 'hello' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
  })

  it('set the content of a text node (space placeholder)', () => {
    const target = document.createElement('div')
    template('<p expr0><span>hello</span> </p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.TEXT,
            childNodeIndex: 1,
            evaluate: (scope) => scope.val,
          },
        ],
      },
    ]).mount(target, { val: 'world' })

    const p = target.querySelector('p')

    expect(p.innerHTML).to.be.equal('<span>hello</span>world')
  })

  it('clear the content of a text node with falsy values', () => {
    const target = document.createElement('div')
    template('<p expr0><span>hello</span> </p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.TEXT,
            childNodeIndex: 1,
            evaluate: (scope) => scope.val,
          },
        ],
      },
    ]).mount(target, { val: null })

    const p = target.querySelector('p')

    expect(p.innerHTML).to.be.equal('<span>hello</span>')
  })

  it('render non null values', () => {
    const target = document.createElement('div')
    template('<p expr0> </p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.TEXT,
            childNodeIndex: 0,
            evaluate: (scope) => scope.val,
          },
        ],
      },
    ]).mount(target, { val: 0 })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('0')
  })
})
