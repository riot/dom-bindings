import {bindingTypes, expressionTypes, template} from '../../src'
import {domNodesToTextArray, getNextSiblingChild} from '../util'

function compareNodesContents(target, selector, items) {
  const domNodes = target.querySelectorAll(selector)

  Array.from(items).forEach((item, index) => {
    expect(domNodes[index].textContent).to.be.equal(`${item}`)
  })
}

function createDummyListTemplate(options = {}) {
  return template('<ul><li expr0></li></ul>', [{
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
    }]),
    ...options
  }])
}

function createDummyListWithSiblingsTemplate(options = {}) {
  return template('<ul><li>first</li><li expr0></li><li>last</li></ul>', [{
    ...{
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
    }, ...options
  }])
}

function runCoreTests(options) {
  it('List reverse', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, {items})

    compareNodesContents(target, 'li', items)

    el.update({items: items.reverse()})

    compareNodesContents(target, 'li', items)

    el.update({items: items.reverse()})

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('Empty list', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, {items})

    compareNodesContents(target, 'li', items)

    el.update({items: []})

    expect(Array.from(target.querySelectorAll('li'))).to.have.length(0)

    el.unmount()
  })

  it('List add', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, {items})

    compareNodesContents(target, 'li', items)

    items.push(6)
    el.update({items: items})

    compareNodesContents(target, 'li', items)

    items.push(7)
    el.update({items: items})

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('List insert in the middle', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, {items})

    compareNodesContents(target, 'li', items)

    items.splice(3, 0, 10)
    el.update({items})

    compareNodesContents(target, 'li', items)

    items.splice(3, 0, 9)
    el.update({items})

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('List prepend', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, {items})

    compareNodesContents(target, 'li', items)

    items.unshift(-1)
    el.update({items})

    compareNodesContents(target, 'li', items)

    items.unshift(-2)
    el.update({items})

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('List pop', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, {items})

    compareNodesContents(target, 'li', items)

    items.pop()
    el.update({items})

    compareNodesContents(target, 'li', items)

    items.pop()
    el.update({items})

    compareNodesContents(target, 'li', items)

    el.unmount()
  })

  it('List shift', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, {items})

    compareNodesContents(target, 'li', items)

    items.shift()
    el.update({items})

    compareNodesContents(target, 'li', items)

    items.shift()
    el.update({items})

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
    }).mount(target, {items})

    const beforeLis = target.querySelectorAll('li')

    expect(beforeLis).to.have.length(3)

    items.push(6)
    items.push(7)
    el.update({items})

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
    }).mount(target, {items})

    const beforeLis = target.querySelectorAll('li')

    expect(beforeLis).to.have.length(3)

    items.push(6)
    items.push(7)
    el.update({items})

    const afterLis = target.querySelectorAll('li')

    expect(afterLis).to.have.length(4)

    el.unmount()
  })

  it('List having siblings nodes', () => {
    const items = [0, 1, 2, 3, 4, 5]
    const target = document.createElement('div')
    const el = createDummyListWithSiblingsTemplate(options).mount(target, {items})

    const beforeLis = target.querySelectorAll('li')

    expect(beforeLis).to.have.length(8)
    expect(beforeLis[0].textContent).to.be.equal('first')
    expect(beforeLis[beforeLis.length - 1].textContent).to.be.equal('last')

    el.update({items: items.reverse()})

    const afterLis = target.querySelectorAll('li')

    expect(afterLis).to.have.length(8)
    expect(beforeLis[0].textContent).to.be.equal('first')
    expect(beforeLis[beforeLis.length - 1].textContent).to.be.equal('last')

    el.unmount()
  })

  it('Each bindings supports any iterable list type', () => {
    const itemsAsString = 'string'
    const itemsAsSet = new Set([1,2,3])

    const target = document.createElement('div')
    const el = createDummyListTemplate(options).mount(target, { items: itemsAsString })

    compareNodesContents(target, 'li', itemsAsString)

    el.update({items: itemsAsSet })

    compareNodesContents(target, 'li', itemsAsSet)

    el.unmount()
  })

  it('Each bindings supports plain objects as a list', () => {
    const items = { en: 'English', it: 'Italian', fr: 'French' }
    const target = document.createElement('div')

    const tmpl = template('<ul><li expr0></li></ul>', [{
      selector: '[expr0]',
      type: bindingTypes.EACH,
      itemName: 'val',
      indexName: 'name',
      evaluate: scope => scope.items,
      template: template('<!---->', [{
        expressions: [
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'value',
            evaluate: scope => scope.val
          },
          {
            type: expressionTypes.ATTRIBUTE,
            name: 'name',
            evaluate: scope => scope.name
          }
        ]
      }]),
      ...options
    }])

    const compareNodes = () => {
      const domNodes = target.querySelectorAll('li')

      Object.entries(items).forEach(([name, value], index) => {
        const targetNode = domNodes[index]

        if (targetNode.hasAttribute('value')) {
          expect(targetNode.getAttribute('value')).to.be.equal(`${value}`)
        }

        if (targetNode.hasAttribute('name')) {
          expect(targetNode.getAttribute('name')).to.be.equal(`${name}`)
        }
      })
    }

    const el = tmpl.mount(target, { items })

    compareNodes(target, 'li')

    items.ru = 'Russian'
    el.update({ items: items })

    compareNodes(target, 'li')

    el.unmount()
  })

  it('Each bindings should not throw if no array will be received', () => {
    const items = null
    const target = document.createElement('div')
    const el = createDummyListWithSiblingsTemplate(options).mount(target, {items})

    const lis = target.querySelectorAll('li')

    expect(lis).to.have.length(2)

    el.unmount()
  })
}

describe('each bindings', () => {
  describe('Keyed vs unkeyed', () => {
    describe('keyed', () => {
      runCoreTests({
        getKey(scope) {
          return scope.val
        }
      })
    })
    describe('unkeyed', () => {
      runCoreTests({})
    })
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
    }]).mount(target, {items})

    const divs = target.querySelectorAll('div')

    expect(divs[0].textContent).to.be.equal('0')
    expect(divs[1].textContent).to.be.equal('1')

    el.unmount()
  })

  it('Looped <template> tags and nested conditional should work properly', () => {
    const target = document.createElement('div')
    const el = template('<ul><template expr1="expr1"></template></ul>', [{
      type: bindingTypes.EACH,
      itemName: 'item',
      template: template('<li expr2="expr2"></li>', [{
        type: bindingTypes.IF,
        evaluate: () => true,
        redundantAttribute: 'expr2',
        selector: '[expr2]',
        template: template(' ', [{
          expressions: [{
            type: expressionTypes.TEXT,
            childNodeIndex: 0,
            evaluate: scope => scope.item
          }]
        }])
      }]),
      redundantAttribute: 'expr1',
      selector: '[expr1]',
      evaluate: scope => scope.items
    }]).mount(target, {
      items: ['aaa', 'bbb', 'ccc', 'ddd']
    })

    expect(target.querySelectorAll('li')).to.have.length(4)

    el.update({
      items: ['eee', 'fff']
    })

    expect(target.querySelectorAll('li')).to.have.length(2)

    el.unmount()
  })

  it('Looped <template> tags with plain text nodes should work properly', () => {
    const target = document.createElement('div')
    const el = template('<template expr1="expr1"></template>', [
      {
        type: bindingTypes.EACH,
        condition: scope => scope.item,
        template: template(
          ' ',
          [
            {
              'expressions': [
                {
                  'type': expressionTypes.TEXT,
                  'childNodeIndex': 0,
                  'evaluate': scope => scope.item
                }
              ]
            }
          ]
        ),
        redundantAttribute: 'expr1',
        selector: '[expr1]',
        itemName: 'item',
        evaluate: scope => scope.items
      }
    ]).mount(target, {
      items: ['aaa', 'bbb', 'ccc', 'ddd']
    })

    expect(target.innerHTML).to.be.equal('aaabbbcccddd')

    el.update({
      items: ['eee', 'fff']
    })

    expect(target.innerHTML).to.be.equal('eeefff')

    el.unmount()
  })

  it('Looped and nested <template> tags with keys should work properly (issue https://github.com/riot/riot/issues/2892)', () => {
    const target = document.createElement('div')
    const el = template(
      '<template expr1="expr1"></template>',
      [
        {
          'type': bindingTypes.EACH,
          'getKey': scope => scope.e,
          'condition': null,
          'template': template(
            '<h1 expr2="expr2"> </h1><p expr3="expr3"></p>',
            [
              {
                'redundantAttribute': 'expr2',
                'selector': '[expr2]',
                'expressions': [
                  {
                    'type': expressionTypes.TEXT,
                    'childNodeIndex': 0,
                    'evaluate': scope => scope.e
                  }
                ]
              },
              {
                'type': bindingTypes.EACH,
                'getKey': null,
                'condition': null,
                'template': template(
                  ' ',
                  [
                    {
                      'expressions': [
                        {
                          'type': expressionTypes.TEXT,
                          'childNodeIndex': 0,
                          'evaluate': scope => [scope.e, scope.x].join('')
                        }
                      ]
                    }
                  ]
                ),
                'redundantAttribute': 'expr3',
                'selector': '[expr3]',
                'itemName': 'x',
                'evaluate': () => [1, 2, 3]
              }
            ]
          ),
          'redundantAttribute': 'expr1',
          'selector': '[expr1]',
          'itemName': 'e',
          'indexName': null,
          'evaluate': scope => scope.items
        }
      ]
    ).mount(target, {
      items: []
    })

    expect(target.querySelectorAll('p')).to.have.length(0)

    el.update({
      items: ['a']
    })

    expect(target.querySelectorAll('h1')).to.have.length(1)

    expect(domNodesToTextArray(target, 'h1')).to.be.deep.equal(['a'])
    expect(target.querySelectorAll('p')).to.have.length(3)

    el.update({
      items: ['a', 'c']
    })

    expect(target.querySelectorAll('h1')).to.have.length(2)
    expect(domNodesToTextArray(target, 'h1')).to.be.deep.equal(['a', 'c'])
    expect(target.querySelectorAll('p')).to.have.length(6)
    expect(getNextSiblingChild(target.querySelectorAll('h1')[0]).innerHTML).to.be.equal('a1')
    expect(getNextSiblingChild(target.querySelectorAll('h1')[1]).innerHTML).to.be.equal('c1')

    el.update({
      items: ['a', 'b', 'c']
    })

    expect(target.querySelectorAll('h1')).to.have.length(3)
    expect(domNodesToTextArray(target, 'h1')).to.be.deep.equal(['a', 'b', 'c'])
    expect(target.querySelectorAll('p')).to.have.length(9)
    expect(getNextSiblingChild(target.querySelectorAll('h1')[0]).innerHTML).to.be.equal('a1')
    expect(getNextSiblingChild(target.querySelectorAll('h1')[1]).innerHTML).to.be.equal('b1')
    expect(getNextSiblingChild(target.querySelectorAll('h1')[2]).innerHTML).to.be.equal('c1')

    el.update({
      items: ['a', 'c']
    })

    expect(target.querySelectorAll('h1')).to.have.length(2)
    expect(domNodesToTextArray(target, 'h1')).to.be.deep.equal(['a', 'c'])
    expect(getNextSiblingChild(target.querySelectorAll('h1')[0]).innerHTML).to.be.equal('a1')
    expect(getNextSiblingChild(target.querySelectorAll('h1')[1]).innerHTML).to.be.equal('c1')
    expect(target.querySelectorAll('p')).to.have.length(6)
  })
})
