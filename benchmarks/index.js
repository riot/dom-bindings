/* eslint-disable no-console */
import jsdomGlobal from 'jsdom-global'
import Benchmark from 'benchmark'
import * as domBindings from '../dist/dom-bindings.js'
import * as oldVersion from './old-version.js'

import keyedListBench from './keyed.list.js'
import eventsBench from './events.js'
import listBench from './list.js'
import ifBench from './if.js'
import mountBench from './mount.js'

// created the dom only on node env
if (globalThis.process) jsdomGlobal()

const suite = new Benchmark.Suite()

const benchmarks = {
  'List with keys': keyedListBench,
  Events: eventsBench,
  'Normal list': listBench,
  'Toggle if': ifBench,
  'Simple mount': mountBench,
}

Object.entries(benchmarks).forEach(([key, bench]) => {
  bench(suite, key, domBindings, document.createElement('div'))
  bench(suite, `${key} (old)`, oldVersion, document.createElement('div'))
})

suite
  .on('cycle', function (event) {
    if (!globalThis.process) {
      console.log(String(event.target))
      return
    }

    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    console.log(String(event.target), `Memory usage: ${mem} MiB`)
    global.gc()
  })
  .on('error', function (e) {
    console.log(e.target.error)
  })
  .run({ async: true })
