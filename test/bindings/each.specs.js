const { template } = require('../../')

function compareNodesContents(target, selector, items) {
  const domNodes = target.querySelectorAll(selector)

  items.forEach((item, index) => {
    expect(domNodes[index].textContent).to.be.equal(`${item}`)
  })
}

function createDummyListTemplate(options = {}) {
  return template('<ul><li expr0></li></ul>', [{...{
    selector: '[expr0]',
    type: 'each',
    itemName: 'val',
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
  }, ...options}])
}

function createDummyListWithSiblingsTemplate(options = {}) {
  return template('<ul><li>first</li><li expr0></li><li>last</li></ul>', [{...{
    selector: '[expr0]',
    type: 'each',
    itemName: 'val',
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
  }, ...options}])
}

function runTests(options) {
  it('List reverse', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, { items })

    compareNodesContents(target, 'li', items)

    el.update({ items: items.reverse() })

    compareNodesContents(target, 'li', items)

    el.update({ items: items.reverse() })

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('List add', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, { items })

    compareNodesContents(target, 'li', items)

    items.push(6)
    el.update({ items: items })

    compareNodesContents(target, 'li', items)

    items.push(7)
    el.update({ items: items })

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('List insert in the middle', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, { items })

    compareNodesContents(target, 'li', items)

    items.splice(3, 0, 10)
    el.update({ items })

    compareNodesContents(target, 'li', items)

    items.splice(3, 0, 9)
    el.update({ items })

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('List prepend', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, { items })

    compareNodesContents(target, 'li', items)

    items.unshift(-1)
    el.update({ items })

    compareNodesContents(target, 'li', items)

    items.unshift(-2)
    el.update({ items })

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('List pop', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, { items })

    compareNodesContents(target, 'li', items)

    items.pop()
    el.update({ items })

    compareNodesContents(target, 'li', items)

    items.pop()
    el.update({ items })

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('List shift', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, { items })

    compareNodesContents(target, 'li', items)

    items.shift()
    el.update({ items })

    compareNodesContents(target, 'li', items)

    items.shift()
    el.update({ items })

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('List filters', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate({
      condition(scope) {
        return scope.val % 2 !== 0
      },
      ...options
    }).mount(target, { items })

    const beforeLis = target.querySelectorAll('li')

    expect(beforeLis).to.have.length(3)

    items.push(6)
    el.update({ items })

    const afterLis = target.querySelectorAll('li')

    expect(afterLis).to.have.length(4)

    el.unmount()
  })

  it('List having siblings nodes', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListWithSiblingsTemplate(options).mount(target, { items })

    const beforeLis = target.querySelectorAll('li')

    expect(beforeLis).to.have.length(8)
    expect(beforeLis[0].textContent).to.be.equal('first')
    expect(beforeLis[beforeLis.length - 1].textContent).to.be.equal('last')

    el.update({ items: items.reverse() })

    const afterLis = target.querySelectorAll('li')

    expect(afterLis).to.have.length(8)
    expect(beforeLis[0].textContent).to.be.equal('first')
    expect(beforeLis[beforeLis.length - 1].textContent).to.be.equal('last')

    el.unmount()
  })
}

describe('each bindings', () => {
  describe('keyed', () => {
    runTests({
      getKey(scope) { return scope.val }
    })
  })

  describe('unkeyed', () => {
    runTests({})
  })
})