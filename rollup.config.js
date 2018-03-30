import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  name: 'riotDOMBindings',
  plugins: [
    resolve({
      jsnext: true
    })
  ],
  output: [
    {
      file: 'dom-bindings.js',
      format: 'umd'
    }
  ]
}