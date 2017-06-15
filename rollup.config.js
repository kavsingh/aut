const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const uglify = require('rollup-plugin-uglify')
const env = process.env.NODE_ENV || 'development'

module.exports = {
    entry: 'src/main.js',
    dest: 'dist/bundle.js',
    format: 'iife',
    plugins: [
        resolve(),
        babel({ exclude: 'node_modules/**' }),
    ].concat(env === 'production'
        ? [uglify()]
        : [],
    ),
}
