import { expressionTypes, template } from '../../src/index.js'
import { fireEvent } from '../util.js'
import { expect } from 'chai'
import sinon from 'sinon'

describe('event specs', () => {
  it('dom events get properly bound', () => {
    const spy = sinon.spy()
    const target = document.createElement('div')
    template('<button expr0/>Click me</button>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.EVENT,
            name: 'onclick',
            evaluate: (scope) => scope.callback,
          },
        ],
      },
    ]).mount(target, { callback: spy })

    const button = target.querySelector('button')

    fireEvent(button, 'click')

    expect(spy).to.have.been.calledOnce
  })

  it('dom events get properly removed', () => {
    const spy = sinon.spy()
    const target = document.createElement('div')
    const el = template('<button expr0/>Click me</button>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.EVENT,
            name: 'onclick',
            evaluate: (scope) => scope.callback,
          },
        ],
      },
    ]).mount(target, { callback: spy })

    const button = target.querySelector('button')

    fireEvent(button, 'click')

    el.update({ callback: null })

    fireEvent(button, 'click')

    expect(spy).to.have.been.calledOnce

    el.unmount()
  })

  it('custom DOM events can be dispatched', () => {
    const spy = sinon.spy()
    const target = document.createElement('div')
    const el = template('<button expr0/>Click me</button>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.EVENT,
            name: 'onclick',
            evaluate: (scope) => scope.callback,
          },
        ],
      },
    ]).mount(target, { callback: spy })

    const button = target.querySelector('button')

    fireEvent(button, 'click')

    el.update({ callback: null })

    fireEvent(button, 'click')

    expect(spy).to.have.been.calledOnce

    el.unmount()
  })

  it('support event options', () => {
    const spy = sinon.spy()
    const target = document.createElement('div')
    const el = template('<button expr0/>Click me</button>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.EVENT,
            name: 'onclick',
            evaluate: (scope) => [scope.callback, { once: true }],
          },
        ],
      },
    ]).mount(target, { callback: spy })

    const button = target.querySelector('button')

    fireEvent(button, 'click')
    fireEvent(button, 'click')
    fireEvent(button, 'click')

    expect(spy).to.have.been.calledOnce

    el.unmount()
  })
})
