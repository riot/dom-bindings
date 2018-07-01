const { template } = require('../../')

describe('each bindings', () => {
  it('List reverse', () => {
    const target = document.createElement('div')
    const el = template('<ul><li expr0></li></ul>', [{
      selector: '[expr0]',
      type: 'each',
      itemName: 'val',
      getKey(scope) { return scope.val },
      evaluate(scope) { return scope.items },
      template: template('<!---->', [{
        expressions: [
          {
            type: 'text',
            childNodeIndex: 0,
            evaluate(scope) { return scope.val }
          }
        ]
      }])
    }]).mount(target, { items: [0, 1, 2, 3, 4, 5] })

    const lisBefore = target.querySelectorAll('li')

    expect(lisBefore[0].textContent).to.be.equal('0')
    expect(lisBefore[1].textContent).to.be.equal('1')
    expect(lisBefore[2].textContent).to.be.equal('2')
    expect(lisBefore[3].textContent).to.be.equal('3')
    expect(lisBefore[4].textContent).to.be.equal('4')
    expect(lisBefore[5].textContent).to.be.equal('5')

    el.update({ items: [5, 4, 3, 2, 1, 0] })

    const lisAfter = target.querySelectorAll('li')

    expect(lisAfter[0].textContent).to.be.equal('5')
    expect(lisAfter[1].textContent).to.be.equal('4')
    expect(lisAfter[2].textContent).to.be.equal('3')
    expect(lisAfter[3].textContent).to.be.equal('2')
    expect(lisAfter[4].textContent).to.be.equal('1')
    expect(lisAfter[5].textContent).to.be.equal('0')
  })
})