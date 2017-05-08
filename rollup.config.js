const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')
const env = process.env.NODE_ENV || 'development'

module.exports = {
    entry: 'src/main.js',
    dest: 'dist/bundle.js',
    format: 'iife',
    plugins: [
        babel({ exclude: 'node_modules/**' }),
    ].concat(env === 'production'
        ? [uglify()]
        : []
    ),
}
