const babel = require('rollup-plugin-babel')

module.exports = {
  entry: 'src/main.js',
  dest: 'dist/bundle.js',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}