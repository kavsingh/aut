const path = require('path')
const webpack = require('webpack')

const isProduction = process.env.NODE_ENV === 'production'
const fromRoot = path.resolve.bind(path, __dirname)
const publicPath = '/'

module.exports = {
    entry: {
        bundle: ['./src/main.js'],
    },
    output: {
        filename: '[name].js',
        path: fromRoot('dist'),
        publicPath,
    },
    devtool: false,
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
        new webpack.EnvironmentPlugin('NODE_ENV'),
        new webpack.optimize.ModuleConcatenationPlugin(),
        isProduction &&
            new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
    ].filter(Boolean),
    resolve: {
        modules: [fromRoot('src'), 'node_modules'],
        extensions: ['.js'],
    },
}
