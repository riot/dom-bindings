import { bindingTypes, expressionTypes, template } from '../../src'

function compareNodesContents(target, selector, items) {
  const domNodes = target.querySelectorAll(selector)

  items.forEach((item, index) => {
    expect(domNodes[index].textContent).to.be.equal(`${item}`)
  })
}

function createDummyListTemplate(options = {}) {
  return template('<ul><li expr0></li></ul>', [{...{
    selector: '[expr0]',
    type: bindingTypes.EACH,
    itemName: 'val',
    evaluate: scope => scope.items,
    template: template('<!---->', [{
      expressions: [
        {
          type: expressionTypes.TEXT,
          childNodeIndex: 0,
          evaluate: scope => scope.val
        }
      ]
    }])
  }, ...options}])
}

function createDummyListWithSiblingsTemplate(options = {}) {
  return template('<ul><li>first</li><li expr0></li><li>last</li></ul>', [{...{
    selector: '[expr0]',
    type: bindingTypes.EACH,
    itemName: 'val',
    evaluate: scope => scope.items,
    template: template('<!---->', [{
      expressions: [
        {
          type: expressionTypes.TEXT,
          childNodeIndex: 0,
          evaluate: scope => scope.val
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
    items.push(7)
    el.update({ items })

    const afterLis = target.querySelectorAll('li')

    expect(afterLis).to.have.length(4)

    el.unmount()
  })

  it('List filters (undefined)', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate({
      condition(scope) {
        return scope.val % 2 !== 0 ? true : undefined
      },
      ...options
    }).mount(target, { items })

    const beforeLis = target.querySelectorAll('li')

    expect(beforeLis).to.have.length(3)

    items.push(6)
    items.push(7)
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

  it('Each bindings should not throw if no array will be received', () => {
    const items = null
    const target = document.createElement('div')
    const el = createDummyListWithSiblingsTemplate(options).mount(target, { items })

    const lis = target.querySelectorAll('li')

    expect(lis).to.have.length(2)

    el.unmount()
  })

  it('Items indexes can be handled via "indexName" property', () => {
    const items = ['a', 'b']
    const target = document.createElement('div')
    const el = template('<div expr0></div>', [{
      selector: '[expr0]',
      type: bindingTypes.EACH,
      indexName: 'index',
      itemName: 'val',
      evaluate: scope => scope.items,
      template: template('<!---->', [{
        expressions: [
          {
            type: expressionTypes.TEXT,
            childNodeIndex: 0,
            evaluate: scope => scope.index
          }
        ]
      }])
    }]).mount(target, { items })

    const divs = target.querySelectorAll('div')

    expect(divs[0].textContent).to.be.equal('0')
    expect(divs[1].textContent).to.be.equal('1')

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