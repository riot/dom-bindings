import { expressionTypes, template } from '../../src/index.js'
import { spy } from 'sinon'
import { expect } from 'chai'

describe('ref specs', () => {
  it('ref attributes register/unregister a dom node', () => {
    const target = document.createElement('div')
    const ref = spy()
    const el = template('<p expr0></p>', [
      {
        selector: '[expr0]',
        expressions: [
          {
            type: expressionTypes.REF,
            evaluate: (scope) => scope.ref,
          },
        ],
      },
    ]).mount(target, { ref })

    expect(ref).to.have.been.calledWith(target.querySelector('p'))

    el.update({ ref })

    expect(ref).to.have.been.calledOnce

    el.unmount()

    expect(ref).to.have.been.calledWith(null)
  })
})
