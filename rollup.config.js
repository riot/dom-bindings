import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  plugins: [
    resolve({
      jsnext: true
    })
  ],
  output: [
    {
      name: 'riotDOMBindings',
      file: 'dist/umd.dom-bindings.js',
      format: 'umd'
    },
    {
      file: 'dist/cjs.dom-bindings.js',
      format: 'cjs'
    }
  ],
}