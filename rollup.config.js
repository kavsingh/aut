const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const minify = require('rollup-plugin-babel-minify')
const prepack = require('rollup-plugin-prepack')
const prepackConfig = require('./.prepackconfig')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    input: 'src/main.js',
    output: {
        file: 'dist/bundle.js',
        format: 'iife',
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs(),
        babel({ exclude: 'node_modules/**' }),
        isProd && prepack(prepackConfig),
        isProd && minify({ comments: false }),
    ].filter(Boolean),
}
