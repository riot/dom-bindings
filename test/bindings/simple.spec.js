import { expressionTypes, template } from '../../src/index.js'
import { expect } from 'chai'

function createDummyTemplate() {
  return template('<p expr0> </p>', [
    {
      selector: '[expr0]',
      expressions: [
        {
          type: expressionTypes.TEXT,
          childNodeIndex: 0,
          evaluate: (scope) => scope.text,
        },
        {
          type: expressionTypes.ATTRIBUTE,
          name: 'class',
          evaluate: (scope) => scope.class,
        },
      ],
    },
  ])
}

describe('simple bindings', () => {
  it('A simple binding will only evaluate the expressions without modifying the DOM structure', () => {
    const target = document.createElement('div')

    const el = createDummyTemplate().mount(target, {
      text: 'hello',
      class: 'foo',
    })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
    expect(p.getAttribute('class')).to.be.equal('foo')
    expect(p).to.be.ok

    el.unmount()
  })

  it('A simple bindings can be updated', () => {
    const target = document.createElement('div')
    const el = createDummyTemplate().mount(target, {
      text: 'hello',
      class: 'foo',
    })

    const p = target.querySelector('p')

    expect(p.textContent).to.be.equal('hello')
    expect(p.getAttribute('class')).to.be.equal('foo')

    el.update({ text: 'world', class: 'bar' })

    expect(p.textContent).to.be.equal('world')
    expect(p.getAttribute('class')).to.be.equal('bar')

    el.unmount()
  })
})
