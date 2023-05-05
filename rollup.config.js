import resolve from '@rollup/plugin-node-resolve'

const base = {
  input: 'src/index.js',
  onwarn(message) {
    if (/Circular/.test(message)) return
    console.error(message) // eslint-disable-line
  },
  plugins: [resolve()],
}

export default [
  {
    ...base,
    output: [
      {
        name: 'riotDOMBindings',
        file: 'dist/dom-bindings.cjs',
        format: 'umd',
        generatedCode: {
          constBindings: true,
        },
      },
    ],
  },
  {
    ...base,
    external: (id) => /@riotjs\/util/.test(id),
    output: [
      {
        file: 'dist/dom-bindings.js',
        format: 'esm',
        generatedCode: {
          constBindings: true,
        },
      },
    ],
  },
]
