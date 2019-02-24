import ignore from 'rollup-plugin-ignore'
import resolve from 'rollup-plugin-node-resolve'

const base  = {
  input: 'src/index.js',
  onwarn(message) {
    if (/Circular/.test(message)) return
    console.error(message) // eslint-disable-line
  },
  plugins: [
    ignore(['@ungap/essential-map']),
    resolve({
      jsnext: true
    })
  ]
}

export default [
  {
    ...base,
    output: [{
      name: 'riotDOMBindings',
      file: 'dist/umd.dom-bindings.js',
      format: 'umd'
    }]
  },
  {
    ...base,
    output: [{
      file: 'dist/esm.dom-bindings.js',
      format: 'esm'
    }]
  }
]

