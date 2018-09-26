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
import { template } from 'riot-dom-bindings'

// Create the app template
const tmpl = template('<p><!----></p>', [{
  selector: 'p',
  expressions: [
    {
      type: 'text',
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
It will create a `TemplateChunk` that could be mounted, updated and unmounted to any DOM node

A template will always need a string as first argument and a list of `Bindings` to work properly.
Consider the following example:

```js
const tmpl = template('<p><!----></p>', [{
  selector: 'p',
  expressions: [
    {
      type: 'text',
      childNodeIndex: 0,
      evaluate(scope) { return scope.greeting },
    },
  ],
}])
```

The template object above will bind a [simple binding](#simple-binding) to the `<p>` tag.


### register(String, Function)

The register method can be used to store custom tags template implementations.
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
  type: 'tag',
  name: 'my-tag',
}])
```



