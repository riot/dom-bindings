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
      file: 'dom-bindings.js',
      format: 'umd'
    }
  ]
}