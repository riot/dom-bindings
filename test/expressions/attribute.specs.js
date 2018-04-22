const { template } = require('../../')

describe('attribute specs', () => {
  it('set simple attribute if it\'s truthy', () => {
    const target = document.createElement('div')
    template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'attribute', name: 'class', evaluate(scope) { return scope.attr }}
      ]
    }]).mount(target, { attr: 'hello' })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello')
  })

  it('remove attribute if it\'s falsy', () => {
    const target = document.createElement('div')
    template('<p class="hello" expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'attribute', name: 'class', evaluate(scope) { return scope.attr }}
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
        { type: 'attribute', name: 'class', evaluate(scope) { return scope.attr }}
      ]
    }]).mount(target, { attr: 'hello' })

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello')

    el.update({ attr: false })

    expect(p.hasAttribute('class')).to.be.not.ok
  })

  it('provide multiple attributes as object', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'attribute', evaluate(scope) { return scope.attr }}
      ]
    }]).mount(target, { attr: { class: 'hello', 'name': 'world' }})

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello')
    expect(p.getAttribute('name')).to.be.equal('world')

    el.update({ attr: false })

    expect(p.hasAttribute('class')).to.be.not.ok
    expect(p.hasAttribute('name')).to.be.not.ok
  })

  it('provide attribute values as array', () => {
    const target = document.createElement('div')
    const el = template('<p expr0></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'attribute', name: 'class', evaluate(scope) { return scope.attr }}
      ]
    }]).mount(target, { attr: ['hello', 'world']})

    const p = target.querySelector('p')

    expect(p.getAttribute('class')).to.be.equal('hello world')

    el.update({ attr: false })

    expect(p.hasAttribute('class')).to.be.not.ok
  })
})