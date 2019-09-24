const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const { default: PrepackPlugin } = require('prepack-webpack-plugin')
const prepackConfig = require('./prepack.config')

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
	devServer: {
		host: 'localhost',
		port: 3000,
		hot: true,
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
		new HtmlPlugin({
			title: 'app',
			template: fromRoot('src/index.html'),
			inject: 'head',
		}),
		isProd && new PrepackPlugin({ prepack: prepackConfig }),
	].filter(Boolean),
	resolve: {
		modules: [fromRoot('src'), 'node_modules'],
		extensions: ['.js'],
	},
}
