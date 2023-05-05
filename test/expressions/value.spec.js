import { expressionTypes, template } from '../../src/index.js'
import { expect } from 'chai'

describe('value specs', () => {
  it('set the value properly', () => {
    const target = document.createElement('div')
    template('<input expr0/>', [
      {
        selector: '[expr0]',
        expressions: [
          { type: expressionTypes.VALUE, evaluate: (scope) => scope.val },
        ],
      },
    ]).mount(target, { val: 'hello' })

    const input = target.querySelector('input')

    expect(input.value).to.be.equal('hello')
    expect(input.getAttribute('value')).to.be.not.ok
  })

  it('update the value properly', () => {
    const target = document.createElement('div')
    const el = template('<textarea expr0/>Baz</textarea>', [
      {
        selector: '[expr0]',
        expressions: [
          { type: expressionTypes.VALUE, evaluate: (scope) => scope.val },
        ],
      },
    ]).mount(target, { val: 'hello' })

    const textarea = target.querySelector('textarea')

    expect(textarea.value).to.be.equal('hello')
    expect(textarea.getAttribute('value')).to.be.not.ok

    el.update({ val: 'world' })

    expect(textarea.value).to.be.equal('world')
    expect(textarea.getAttribute('value')).to.be.not.ok
  })

  it('undefined values should render clean strings', () => {
    const target = document.createElement('div')
    template('<input expr0/>', [
      {
        selector: '[expr0]',
        expressions: [
          { type: expressionTypes.VALUE, evaluate: (scope) => scope.val },
        ],
      },
    ]).mount(target, { val: undefined })

    const input = target.querySelector('input')

    expect(input.value).to.be.equal('')
    expect(input.getAttribute('value')).to.be.not.ok
  })
})
