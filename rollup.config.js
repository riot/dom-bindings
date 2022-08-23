import alias from '@rollup/plugin-alias'
import resolve from '@rollup/plugin-node-resolve'

const base  = {
  input: 'src/index.js',
  onwarn(message) {
    if (/Circular/.test(message)) return
    console.error(message) // eslint-disable-line
  },
  plugins: [
    alias({
      entries: [{
        find: '@ungap/essential-map', replacement: 'src/map.js'
      }]
    }),
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
    external: id => /@riotjs\/util/.test(id),
    output: [{
      file: 'dist/esm.dom-bindings.js',
      format: 'esm'
    }]
  }
]

