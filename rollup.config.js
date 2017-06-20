const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babili = require('rollup-plugin-babili')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    entry: 'src/main.js',
    dest: 'dist/bundle.js',
    format: 'iife',
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs(),
        babel({ exclude: 'node_modules/**' }),
        isProd && babili({ comments: false }),
    ].filter(Boolean),
}
