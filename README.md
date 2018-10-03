# dom-bindings

[![Build Status][travis-image]][travis-url]
[![Code Quality][codeclimate-image]][codeclimate-url]
[![NPM version][npm-version-image]][npm-url]
[![NPM downloads][npm-downloads-image]][npm-url]
[![MIT License][license-image]][license-url]
[![Coverage Status][coverage-image]][coverage-url]

# This project is a WIP 🚧 🚧 🚧
## Come back soon...

## Usage

```js
import { template, expressionTypes } from 'riot-dom-bindings'

// Create the app template
const tmpl = template('<p><!----></p>', [{
  selector: 'p',
  expressions: [
    {
      type: expressionTypes.TEXT,
      childNodeIndex: 0,
      evaluate(scope) { return scope.greeting },
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

[npm-version-image]:http://img.shields.io/npm/v/riot-dom-bindings.svg?style=flat-square
[npm-downloads-image]:http://img.shields.io/npm/dm/riot-dom-bindings.svg?style=flat-square
[npm-url]:https://npmjs.org/package/riot-dom-bindings

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


### register(String, Function)

The register method can be used to store custom tags template implementations.
<details>
 <summary>Details</summary>
If a custom tag template was previously registered, its template will be mounted via [tag binding](#tag-binding)

```js
// Store a custom tag implementation
registry.set('my-tag', function({ slots, bindings, attributes }) {
  const tmpl = template('hello world')
  return tmpl
})

// The <my-tag> will be automatically mounted with the "hello world" text in it
const tmpl = template('<section><my-tag class="a-custom-tag"/></section>', [{
  selector: '.a-custom-tag',
  type: bindingTypes.TAG,
  name: 'my-tag',
}])
```
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
    - type: `<Array>`
    - required: `true`
    - description: array containing instructions to execute DOM manipulation on the node queried
  - `type`
    - type: `<Number>`
    - default:`bindingTypes.SIMPLE`
    - optional: `true`
    - description: id of the binding to use on the node queried. This id must be one of the keys available in the `bindingTypes` object
  - `selector`
    - type: `<String>`
    - default: binding root **HTMLElement**
    - optional: `true`
    - description: property to query the node element that needs to updated

The bindings supported are only of 4 different types:

- `simple` to bind simply the expressions to a DOM structure
- `if` to handle conditional DOM structures
- `each` to render DOM lists
- `tag` to mount registered tag templates to any DOM node

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
    type: 'text',
    childNodeIndex: 0,
    evaluate: scope => scope.greeting,
  }]
}

template('<p><!----></p>', [pGreeting])
```

In this case we have created a binding to update only the content of a `p` tag.<br/>
*Notice that the `p` tag has an empty comment that will be replaced with the value of the binding expression whenever the template will be mounted*

</details>

#### Simple Binding Expressions

The simple binding supports DOM manipulations only via expressions.

<details>
 <summary>Details</summary>
An expression object must have always at least the following keys:

  - `evaluate`
    - type: `<Function>`
    - description: function that will receive the current template scope and will return the current expression value
  - `type`
    - type: `<Number>`
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
{ type: expressionTypes.EVENT, evaluate(scope) { return function() { console.log('Hello There') } }}
```

To remove an event listener you should only `return null` via evaluate function:

```js
// remove an event listener
{ type: expressionTypes.EVENT, evaluate(scope) { return null } }}
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


