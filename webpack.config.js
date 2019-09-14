const path = require('path')
// TODO: fix prepack issues
// const { default: PrepackPlugin } = require('prepack-webpack-plugin')
// const prepackConfig = require('./prepack.config')

const isProd = process.env.NODE_ENV === 'production'
const fromRoot = path.resolve.bind(path, __dirname)
const publicPath = '/'

module.exports = {
    mode: isProd ? 'production' : 'development',
    entry: {
        bundle: ['./src/main.js'],
    },
    output: {
        filename: '[name].js',
        path: fromRoot('dist'),
        publicPath,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: fromRoot('node_modules'),
                use: [{ loader: 'babel-loader' }],
            },
        ],
    },
    plugins: [
        // TODO: fix prepack issues
        // isProd && new PrepackPlugin({ prepack: prepackConfig }),
    ].filter(Boolean),
    resolve: {
        modules: [fromRoot('src'), 'node_modules'],
        extensions: ['.js'],
    },
}
