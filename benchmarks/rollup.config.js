import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'benchmarks/index.js',
  onwarn(message) {
    if (/Circular/.test(message)) return
    console.error(message) // eslint-disable-line
  },
  plugins: [resolve()],
  external: ['jsdom-global', 'benchmark'],
  output: [
    {
      file: 'benchmarks/bundle.js',
      format: 'umd',
      name: 'bench',
      generatedCode: {
        constBindings: true,
      },
    },
  ],
}
