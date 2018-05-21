const { template } = require('../../')

function fireEvent(el, name) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(name, false, true)
  el.dispatchEvent(e)
}

describe('event specs', () => {
  it('dom events get properly bound', () => {
    const spy = sinon.spy()
    const target = document.createElement('div')
    template('<button expr0/>Click me</button>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'event', name: 'onclick', evaluate(scope) { return scope.callback }}
      ]
    }]).mount(target, { callback: spy })

    const button = target.querySelector('button')

    fireEvent(button, 'click')

    expect(spy).to.have.been.calledOnce
  })

  it('dom events get properly removed', () => {
    const spy = sinon.spy()
    const target = document.createElement('div')
    const el = template('<button expr0/>Click me</button>', [{
      selector: '[expr0]',
      expressions: [
        { type: 'event', name: 'onclick', evaluate(scope) { return scope.callback }}
      ]
    }]).mount(target, { callback: spy })

    const button = target.querySelector('button')

    fireEvent(button, 'click')

    el.update({ callback: null })

    fireEvent(button, 'click')

    expect(spy).to.have.been.calledOnce
  })
})