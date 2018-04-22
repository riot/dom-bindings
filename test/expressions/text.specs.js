const { template } = require('../../')

describe('text specs', () => {
  it('set the content of a text node (comment placeholder)', () => {
    const target = document.createElement('div')
    template('<p expr0><----></p>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'text', childNodeIndex: 0, evaluate(scope) { return scope.val }}
      ]
    }]).mount(target, { val: 'hello' })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
  })

  it('set the content of a text node (space placeholder)', () => {
    const target = document.createElement('div')
    template('<p expr0><span>hello</span> </p>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'text', childNodeIndex: 1, evaluate(scope) { return scope.val }}
      ]
    }]).mount(target, { val: 'world' })

    const p = target.querySelector('p')

    expect(p.innerHTML).to.be.equal('<span>hello</span>world')
  })

  it('clear the content of a text node with falsy values', () => {
    const target = document.createElement('div')
    template('<p expr0><span>hello</span> </p>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'text', childNodeIndex: 1, evaluate(scope) { return scope.val }}
      ]
    }]).mount(target, { val: false })

    const p = target.querySelector('p')

    expect(p.innerHTML).to.be.equal('<span>hello</span>')
  })
})