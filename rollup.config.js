import resolve from 'rollup-plugin-node-resolve'

const base  = {
  input: 'src/index.js',
  onwarn(message) {
    if (/Circular/.test(message)) return
    console.error(message) // eslint-disable-line
  },
  plugins: [
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
    external: ['domdiff', 'curri'],
    output: [{
      file: 'dist/esm.dom-bindings.js',
      format: 'esm'
    }]
  }
]

