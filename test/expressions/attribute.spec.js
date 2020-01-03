import { expressionTypes, template } from '../../src'
import {spy} from 'sinon'

describe('attribute specs', () => {
  it('set simple attribute if it\'s truthy', () => {
    const target = document.createElement('div')
    template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, name: 'class', evaluate: scope => scope.attr }
      ]
    }]).mount(target, { attr: 'hello' })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello')
  })

  it('set boolean attributes', () => {
    const target = document.createElement('div')
    template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, name: 'selected', evaluate: scope => scope.attr }
      ]
    }]).mount(target, { attr: true })

    const p = target.querySelector('p')

    expect(p.getAttribute('selected')).to.be.equal('selected')
    expect(p.selected).to.be.ok
  })

  it('remove attribute if it\'s falsy', () => {
    const target = document.createElement('div')
    template('<p class="hello" expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, name: 'class', evaluate: scope => scope.attr }
      ]
    }]).mount(target, { attr: '' })

    const p = target.querySelector('p')

    expect(p.hasAttribute('class')).to.be.not.ok
  })

  it('do not remove remove number attributes', () => {
    const target = document.createElement('div')
    template('<p class="hello" expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, name: 'class', evaluate: scope => scope.attr }
      ]
    }]).mount(target, { attr: 0 })

    const p = target.querySelector('p')

    expect(p.hasAttribute('class')).to.be.ok
  })

  it('toggle attribute', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, name: 'class', evaluate: scope => scope.attr }
      ]
    }]).mount(target, { attr: 'hello' })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello')

    el.update({ attr: null })

    expect(p.hasAttribute('class')).to.be.not.ok
  })

  it('provide multiple attributes as object', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, evaluate: scope => scope.attr }
      ]
    }]).mount(target, { attr: { class: 'hello', 'name': 'world' }})

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello')
    expect(p.getAttribute('name')).to.be.equal('world')

    el.update({ attr: null })

    expect(p.hasAttribute('class')).to.be.not.ok
    expect(p.hasAttribute('name')).to.be.not.ok
  })

  it('object attributes will be skipped', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, name: 'class', evaluate: scope => scope.attr }
      ]
    }]).mount(target, { attr: {}})

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.not.ok

    el.update({ attr: 'hello' })

    expect(p.hasAttribute('class')).to.be.ok
  })

  it('function attributes will be skipped', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, name: 'class', evaluate: scope => scope.attr }
      ]
    }]).mount(target, { attr: () => {} })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.not.ok

    el.update({ attr: 'hello' })

    expect(p.hasAttribute('class')).to.be.ok
  })

  it('object attributes will be set as DOM properties', () => {
    const target = document.createElement('div')
    template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, name: 'foo', evaluate: scope => scope.attr }
      ]
    }]).mount(target, { attr: { bar: 'bar' }})

    const p = target.querySelector('p')

    expect(p.foo.bar).to.be.equal('bar')
  })

  it('native HTMLElement properties can not be overridden', () => {
    const target = document.createElement('div')
    const removeSpy = spy()
    template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, name: 'remove', evaluate: scope => scope.remove },
        { type: expressionTypes.ATTRIBUTE, name: 'hidden', evaluate: scope => scope.isHidden }
      ]
    }]).mount(target, { remove: removeSpy, isHidden: true })

    const p = target.querySelector('p')

    p.remove()

    expect(removeSpy).to.have.been.not.called
  })
})