import { expressionTypes, template } from '../../src'

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

    expect(p.hasAttribute('class')).to.be.equal
    expect(p.hasAttribute('name')).to.be.not.ok
  })

  it('provide attribute values as array', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: expressionTypes.ATTRIBUTE, name: 'class', evaluate: scope => scope.attr }
      ]
    }]).mount(target, { attr: ['hello', 'world']})

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello world')

    el.update({ attr: null })

    expect(p.hasAttribute('class')).to.be.not.ok
  })
})