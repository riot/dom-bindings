import { expressionTypes, template } from '../../src/index.js'
import { spy } from 'sinon'
import { expect } from 'chai'

describe('attribute specs', () => {
  it("set simple attribute if it's truthy", () => {
    const target = document.createElement('div')
    template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'class',
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: 'hello' })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello')
  })

  it('set boolean attributes (isBoolean=true)', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'selected',
            isBoolean: true,
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: true })

    const p = target.querySelector('p')

    expect(p.getAttribute('selected')).to.be.equal('selected')
    expect(p.selected).to.be.ok

    el.update({
      attr: false,
    })

    expect(p.hasAttribute('selected')).to.be.not.ok
    expect(p.selected).to.be.not.ok
  })

  it('set boolean attributes (isBoolean=false)', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'is-active',
            isBoolean: false,
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: true })

    const p = target.querySelector('p')

    expect(p.getAttribute('is-active')).to.be.equal('true')
    expect(p['is-active']).to.be.equal(true)

    el.update({ attr: false })

    expect(p.getAttribute('is-active')).to.be.equal('false')
    expect(p['is-active']).to.be.equal(false)
  })

  it('number attributes will be rendered', () => {
    const target = document.createElement('div')
    template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'class',
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: 1 })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('1')
  })

  it("remove attribute if it's undefined or null", () => {
    const createExpression = (attr, name, key) => ({
      selector: `[${attr}]`,
      expressions: [
        {
          type: expressionTypes.ATTRIBUTE,
          name,
          evaluate: (scope) => scope[key],
        },
      ],
    })

    const target = document.createElement('div')
    template('<p class="hello" expr0 expr1 expr2 expr3 expr4></p>', [
      createExpression('expr3', 'as-null', 'asNull'),
      createExpression('expr4', 'as-undefined', 'asUndefined'),
    ]).mount(target, {
      asNull: null,
      asVoid: undefined,
    })

    const p = target.querySelector('p')

    expect(p.hasAttribute('as-null')).to.be.not.ok
    expect(p.hasAttribute('as-undefined')).to.be.not.ok
  })

  it('do not remove remove number attributes', () => {
    const target = document.createElement('div')
    template('<p class="hello" expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'class',
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: 0 })

    const p = target.querySelector('p')

    expect(p.hasAttribute('class')).to.be.ok
  })

  it('Expressions will replace own attributes', () => {
    const target = document.createElement('div')
    template('<p test="bar" expr0 test="baz"></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'test',
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: 'foo' })

    const p = target.querySelector('p')

    expect(p.getAttribute('test')).to.be.equal('foo')
  })

  it('toggle attribute', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'class',
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: 'hello' })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello')

    el.update({ attr: null })

    expect(p.hasAttribute('class')).to.be.not.ok
  })

  it('provide multiple attributes as object', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          { type: expressionTypes.ATTRIBUTE, evaluate: (scope) => scope.attr },
        ],
      },
    ]).mount(target, { attr: { class: 'hello', name: 'world' } })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello')
    expect(p.getAttribute('name')).to.be.equal('world')

    el.update({ attr: null })

    expect(p.hasAttribute('class')).to.be.not.ok
    expect(p.hasAttribute('name')).to.be.not.ok
  })

  it('reset object attributes', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          { type: expressionTypes.ATTRIBUTE, evaluate: (scope) => scope.attr },
        ],
      },
    ]).mount(target, { attr: { class: 'hello', name: 'world' } })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello')
    expect(p.getAttribute('name')).to.be.equal('world')

    el.update({ attr: {} })

    expect(p.hasAttribute('class')).to.be.not.ok
    expect(p.hasAttribute('name')).to.be.not.ok
  })

  it('object attributes will be skipped', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'class',
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: {} })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.not.ok

    el.update({ attr: 'hello' })

    expect(p.hasAttribute('class')).to.be.ok
  })

  it('symbol attributes will be skipped', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'class',
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: Symbol() })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.not.ok

    el.update({ attr: 'hello' })

    expect(p.hasAttribute('class')).to.be.ok
  })

  it('array attributes will be skipped', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'class',
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: ['hello', 'there'] })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.not.ok

    el.update({ attr: 'hello' })

    expect(p.hasAttribute('class')).to.be.ok
  })

  it('function attributes will be skipped', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'class',
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: () => {} })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.not.ok

    el.update({ attr: 'hello' })

    expect(p.hasAttribute('class')).to.be.ok
  })

  it('object attributes will be set as DOM properties', () => {
    const target = document.createElement('div')
    template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'foo',
            evaluate: (scope) => scope.attr,
          },
        ],
      },
    ]).mount(target, { attr: { bar: 'bar' } })

    const p = target.querySelector('p')

    expect(p.foo.bar).to.be.equal('bar')
  })

  it('native HTMLElement properties can not be overridden', () => {
    const target = document.createElement('div')
    const removeSpy = spy()
    template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'remove',
            evaluate: (scope) => scope.remove,
          },
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'hidden',
            evaluate: (scope) => scope.isHidden,
          },
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'id',
            evaluate: (scope) => scope.id,
          },
        ],
      },
    ]).mount(target, { remove: removeSpy, isHidden: true, id: 'my-id' })

    const p = target.querySelector('p')

    p.remove()

    expect(removeSpy).to.have.been.not.called
  })
})
