const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

module.exports = {
  plugins: [
    resolve({
      jsnext: true
    }),
    commonjs()
  ],
  output: {
    format: 'iife',
    name: 'riotDomBindings',
    sourcemap: 'inline'
  },
}