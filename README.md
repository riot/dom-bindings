# dom-bindings

[![Build Status][travis-image]][travis-url]
[![Code Quality][codeclimate-image]][codeclimate-url]
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Coverage Status][coverage-image]][coverage-url]

## Usage

```js
import { template, expressionTypes } from '@riotjs/dom-bindings'

// Create the app template
const tmpl = template('<p><!----></p>', [{
  selector: 'p',
  expressions: [
    {
      type: expressionTypes.TEXT,
      childNodeIndex: 0,
      evaluate: scope => scope.greeting,
    },
  ],
}])

// Mount the template to any DOM node
const target = document.getElementById('app')

const app = tmpl.mount(target, {
  greeting: 'Hello World'
})
```

[travis-image]:https://img.shields.io/travis/riot/dom-bindings.svg?style=flat-square
[travis-url]:https://travis-ci.org/riot/dom-bindings

[license-image]:http://img.shields.io/badge/license-MIT-000000.svg?style=flat-square
[license-url]:LICENSE

[npm-version-image]:http://img.shields.io/npm/v/@riotjs/dom-bindings.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/@riotjs/dom-bindings.svg?style=flat-square
[npm-url]:https://npmjs.org/package/@riotjs/dom-bindings

[coverage-image]:https://img.shields.io/coveralls/riot/dom-bindings/master.svg?style=flat-square
[coverage-url]:https://coveralls.io/r/riot/dom-bindings/?branch=master

[codeclimate-image]:https://api.codeclimate.com/v1/badges/d0b7c555a1673354d66f/maintainability
[codeclimate-url]:https://codeclimate.com/github/riot/dom-bindings/maintainability

## API

### template(String, Array)

The template method is the most important of this package.
It will create a `TemplateChunk` that could be mounted, updated and unmounted to any DOM node.

<details>
  <summary>Details</summary>

A template will always need a string as first argument and a list of `Bindings` to work properly.
Consider the following example:

```js
const tmpl = template('<p><!----></p>', [{
  selector: 'p',
  expressions: [
    {
      type: expressionTypes.TEXT,
      childNodeIndex: 0,
      evaluate: scope => scope.greeting
    }
  ],
}])
```

The template object above will bind a [simple binding](#simple-binding) to the `<p>` tag.

</details>

### bindingTypes

Object containing all the type of bindings supported

### expressionTypes

Object containing all the expressions types supported

## Bindings

A binding is simply an object that will be used internally to map the data structure provided to a DOM tree.

<details>
  <summary>Details</summary>
To create a binding object you might use the following  properties:

- `expressions`
  - type: `Array<Expression>`
  - required: `true`
  - description: array containing instructions to execute DOM manipulation on the node queried
- `type`
  - type: `Number`
  - default:`bindingTypes.SIMPLE`
  - optional: `true`
  - description: id of the binding to use on the node queried. This id must be one of the keys available in the `bindingTypes` object
- `selector`
  - type: `String`
  - default: binding root **HTMLElement**
  - optional: `true`
  - description: property to query the node element that needs to updated

The bindings supported are only of 4 different types:

- [`simple`](#simple-binding) to bind simply the expressions to a DOM structure
- [`each`](#each-binding) to render DOM lists
- [`if`](#if-binding) to handle conditional DOM structures
- [`tag`](#tag-binding) to mount a coustom tag template to any DOM node

Combining the bindings above we can map any javascript object to a DOM template.

</details>

### Simple Binding

These kind of bindings will be only used to connect the expressions to DOM nodes in order to manipulate them.

<details>
  <summary>Details</summary>

**Simple bindings will never modify the DOM tree structure, they will only target a single node.**<br/>
A simple binding must always contain at least one of the following expression:

- `attribute` to update the node attributes
- `event` to set the event handling
- `text` to update the node content
- `value` to update the node value

For example, let's consider the following binding:

```js
const pGreetingBinding = {
  selector: 'p',
  expressions: [{
    type: expressionTypes.Text,
    childNodeIndex: 0,
    evaluate: scope => scope.greeting,
  }]
}

template('<article><p><!----></p></article>', [pGreeting])
```

In this case we have created a binding to update only the content of a `p` tag.<br/>
*Notice that the `p` tag has an empty comment that will be replaced with the value of the binding expression whenever the template will be mounted*

</details>

#### Simple Binding Expressions

The simple binding supports DOM manipulations only via expressions.

<details>
  <summary>Details</summary>
An expression object must have always at least the following properties:

- `evaluate`
  - type: `Function`
  - description: function that will receive the current template scope and will return the current expression value
- `type`
  - type: `Number`
  - description: id to find the expression we need to apply to the node. This id must be one of the keys available in the `expressionTypes` object

</details>

##### Attribute Expression

The attribute expression allows to update all the DOM node attributes.

<details>
  <summary>Details</summary>
  This expression might contain the optional `name` key to update a single attribute for example:

  ```js
  // update only the class attribute
  { type: expressionTypes.ATTRIBUTE, name: 'class', evaluate(scope) { return scope.attr }}
  ```

  If the `name` key will not be defined and the return of the `evaluate` function will be an object, this expression will set all the pairs `key, value` as DOM attributes. <br/>
  Given the current scope `{ attr: { class: 'hello', 'name': 'world' }}`, the following expression will allow to set all the object attributes:

  ```js
  { type: expressionTypes.ATTRIBUTE, evaluate(scope) { return scope.attr }}
  ```

  If the return value of the evaluate function will be a `Boolean` the attribute will be considered a boolean attribute like `checked` or `selected`...
</details>

##### Event Expression

The event expression is really simple, It must contain the `name` attribute and it will set the callback as `dom[name] = callback`.

<details>
  <summary>Details</summary>
For example:

```js
// add an event listener
{ type: expressionTypes.EVENT, name: 'onclick', evaluate(scope) { return function() { console.log('Hello There') } }}
```

To remove an event listener you should only `return null` via evaluate function:

```js
// remove an event listener
{ type: expressionTypes.EVENT, name: 'onclick', evaluate(scope) { return null } }}
```

</details>

##### Text Expression

The text expression must contain the `childNodeIndex` that will be used to identify which childNode from the `element.childNodes` collection will need to update its text content.

<details>
  <summary>Details</summary>
Given for example the following template:

```html
<p><b>Your name is:</b><i>user_icon</i><!----></p>
```

we could use the following text expression to replace the CommentNode with a TextNode

```js
{ type: expressionTypes.TEXT, childNodeIndex: 2, evaluate(scope) { return 'Gianluca' } }}
```
</details>

##### Value Expression

The value expression will just set the `element.value` with the value received from the evaluate function.

<details>
  <summary>Details</summary>
It should be used only for form elements and it might look like the example below:

```js
{ type: expressionTypes.VALUE, evaluate(scope) { return scope.val }}
```

</details>

### Each Binding

The `each` binding is used to create multiple DOM nodes of the same type. This binding is typically used in to render javascript collections.

<details>
  <summary>Details</summary>

**`each` bindings will need a template that will be cloned, mounted and updated for all the instances of the collection.**<br/>
An each binding should contain the following properties:

- `itemName`
  - type: `String`
  - required: `true`
  - description: name to identify the item object of the current iteration
- `indexName`
  - type: `Number`
  - optional: `true`
  - description: name to identify the current item index
- `evaluate`
  - type: `Function`
  - required: `true`
  - description: function that will return the collection to iterate
- `template`
  - type: `TemplateChunk`
  - required: `true`
  - description: a dom-bindings template that will be used as skeleton for the DOM elements created
- `condition`
  - type: `Function`
  - optional: `true`
  - description: function that can be used to filter the items from the collection

The each bindings have the highest [hierarchical priority](#bindings-hierarchy) compared to the other riot bindings.
The following binding will loop through the `scope.items` collection creating several `p` tags having as TextNode child value dependent loop item received

```js
const eachBinding = {
  type: bindingTypes.EACH,
  itemName: 'val',
  indexName: 'index'
  evaluate: scope => scope.items,
  template: template('<!---->', [{
    expressions: [
      {
        type: expressionTypes.TEXT,
        childNodeIndex: 0,
        evaluate: scope => `${scope.val} - ${scope.index}`
      }
    ]
  }
}

template('<p></p>', [eachBinding])
```
</details>

### If Binding

The `if` bindings are needed to handle conditionally entire parts of your components templates

<details>
  <summary>Details</summary>

**`if` bindings will need a template that will be mounted and unmounted depending on the return value of the evaluate function.**<br/>
An if binding should contain the following properties:

- `evaluate`
  - type: `Function`
  - required: `true`
  - description: if this function will return truthy values the template will be mounted otherwise unmounted
- `template`
  - type: `TemplateChunk`
  - required: `true`
  - description: a dom-bindings template that will be used as skeleton for the DOM element created

The following binding will render the `b` tag only if the `scope.isVisible` property will be truthy. Otherwise the `b` tag will be removed from the template

```js
const ifBinding = {
  type: bindingTypes.IF,
  evaluate: scope => scope.isVisible,
  selector: 'b'
  template: template('<!---->', [{
    expressions: [
      {
        type: expressionTypes.TEXT,
        childNodeIndex: 0,
        evaluate: scope => scope.name
      }
    ]
  }])
}

template('<p>Hello there <b></b></p>', [ifBinding])
```
</details>

### Tag Binding

The `tag` bindings are needed to mount custom components implementations

<details>
  <summary>Details</summary>

`tag` bindings will enhance any child node with a custom component factory function. These bindings are likely riot components that must be mounted as children in a parent component template

A tag binding might contain the following properties:

- `getComponent`
  - type: `Function`
  - required: `true`
  - description: the factory function responsible for the tag creation
- `evaluate`
  - type: `Function`
  - required: `true`
  - description: it will receive the current scope and it must return the component id that will be passed as first argument to the `getComponent` function
- `slots`
  - type: `Array<Slot>`
  - optional: `true`
  - description: array containing the slots that must be mounted into the child tag
- `attributes`
  - type: `Array<AttributeExpression>`
  - optional: `true`
  - description: array containing the attribute values that should be passed to the child tag

The following tag binding will upgrade the `time` tag using the `human-readable-time` template.
This is how the `human-readable-time` template might look like

```js
import moment from 'moment'

export default function HumanReadableTime({ attributes }) {
  const dateTimeAttr = attributes.find(({ name }) => name === 'datetime')

  return template('<!---->', [{
    expressions: [{
      type: expressionTypes.TEXT,
      childNodeIndex: 0,
      evaluate(scope) {
        const dateTimeValue = dateTimeAttr.evaluate(scope)
        return moment(new Date(dateTimeValue)).fromNow()
      }
    }, ...attributes.map(attr => {
      return {
        ...attr,
        type: expressionTypes.ATTRIBUTE
      }
    })]
  }])
}
```

Here it's how the previous tag might be used in a `tag` binding
```js
import HumanReadableTime from './human-readable-time'

const tagBinding = {
  type: bindingTypes.TAG,
  evaluate: () => 'human-readable-time',
  getComponent: () => HumanReadableTime,
  selector: 'time',
  attributes: [{
    evaluate: scope => scope.time,
    name: 'datetime'
  }]
}

template('<p>Your last commit was: <time></time></p>', [tagBinding]).mount(app, {
  time: '2017-02-14'
})
```

The `tag` bindings have always a lower priority compared to the `if` and `each` bindings
</details>

#### Slot Binding

The slot binding will be used to manage nested slotted templates that will be update using parent scope

<details>
  <summary>Details</summary>
An expression object must have always at least the following properties:

- `evaluate`
  - type: `Function`
  - description: function that will receive the current template scope and will return the current expression value
- `type`
  - type: `Number`
  - description: id to find the expression we need to apply to the node. This id must be one of the keys available in the `expressionTypes` object
- `name`
  - type: `String`
  - description: the name to identify the binding html we need to mount in this node


```js
// slots array that will be mounted receiving the scope of the parent template
const slots = [{
  id: 'foo',
  bindings: [{
    selector: '[expr1]',
    expressions: [{
      type: expressionTypes.TEXT,
      childNodeIndex: 0,
      evaluate: scope => scope.text
    }]
  }],
  html: '<p expr1><!----></p>'
}]

const el = template('<article><slot expr0/></article>', [{
  type: bindingTypes.SLOT,
  selector: '[expr0]',
  name: 'foo'
}]).mount(app, {
  slots
}, { text: 'hello' })
```

</details>

## Bindings Hierarchy

If the same DOM node has multiple bindings bound to it, they should be created following the order below:

1. Each Binding
2. If Binding
3. Tag Binding

<details>
  <summary>Details</summary>

Let's see some cases where we might combine multiple bindings on the same DOM node and how to handle them properly.

### Each and If Bindings
Let's consider for example a DOM node that sould handle in parallel the Each and If bindings.
In that case we could skip the `If Binding` and just use the `condition` function provided by the [`Each Binding`](#each-binding)
Each bindings will handle conditional rendering internally without the need of extra logic.

### Each and Tag Bindings
A custom tag having an Each Binding bound to it should be handled giving the priority to the Eeach Binding. For example:

```js
const components = {
  'my-tag': function({ slots, attributes }) {
    return {
      mount(el, scope) {
        // do stuff on the mount
      },
      unmount() {
        // do stuff on the unmount
      }
    }
  }
}
const el = template('<ul><li expr0></li></ul>', [{
  type: bindingTypes.EACH,
  itemName: 'val',
  selector: '[expr0]',
  evaluate: scope => scope.items,
  template: template(null, [{
    type: bindingTypes.TAG,
    name: 'my-tag',
    getComponent(name) {
      // name here will be 'my-tag'
      return components[name]
    }
  }])
}]).mount(target, { items: [1, 2] })
```

The template for the Each Binding above will be created receiving `null` as first argument because we suppose that the custom tag template was already stored and registered somewhere else.

### If and Tag Bindings
Similar to the previous example, If Bindings have always the priority on the Tag Bindings. For example:

```js
const el = template('<ul><li expr0></li></ul>', [{
  type: bindingTypes.IF,
  selector: '[expr0]',
  evaluate: scope => scope.isVisible,
  template: template(null, [{
    type: bindingTypes.TAG,
    evaluate: () => 'my-tag',
    getComponent(name) {
      // name here will be 'my-tag'
      return components[name]
    }
  }])
}]).mount(target, { isVisible: true })
```

The template for the IF Binding will mount/unmount the Tag Binding on its own DOM node.

</details>

