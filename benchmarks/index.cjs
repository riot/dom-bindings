/* eslint-disable no-console */
require('jsdom-global')()
require('../polyfills/range.cjs')

const Benchmark = require('benchmark'),
  suite = new Benchmark.Suite(),
  domBindings = require('../dist/dom-bindings.cjs'),
  oldVersion = require('./old-version.cjs'),
  benchmarks = {
    'List with keys': require('./keyed.list.cjs'),
    Events: require('./events.cjs'),
    'Normal list': require('./list.cjs'),
    'Toggle if': require('./if.cjs'),
    'Simple mount': require('./if.cjs'),
  }

Benchmark.support.browser = false

Object.entries(benchmarks).forEach(([key, bench]) => {
  bench(suite, key, domBindings)
  bench(suite, `${key} (old)`, oldVersion)
})

suite
  .on('cycle', function (event) {
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    console.log(String(event.target), `Memory usage: ${mem} MiB`)
    global.gc()
  })
  .on('error', function (e) {
    console.log(e.target.error)
  })
  .run()
