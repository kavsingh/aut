const path = require('path')

const HtmlPlugin = require('html-webpack-plugin')
const HtmlInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const NoEmitPlugin = require('no-emit-webpack-plugin')
const { default: PrepackPlugin } = require('prepack-webpack-plugin')

const prepackConfig = require('./prepack.config')

const isProduction = process.env.NODE_ENV === 'production'
const fromRoot = path.resolve.bind(path, __dirname)
const publicPath = '/'

module.exports = {
	mode: isProduction ? 'production' : 'development',
	entry: {
		bundle: ['./src/main.ts'],
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
				test: /\.ts$/,
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
			inlineSource: '.js',
			minify: isProduction
				? {
						collapseWhitespace: true,
						minifyCSS: true,
						minifyJS: true,
						removeComments: true,
						removeRedundantAttributes: true,
						removeScriptTypeAttributes: true,
						removeStyleLinkTypeAttributes: true,
						useShortDoctype: true,
				  }
				: false,
		}),
		...(isProduction
			? [
					new HtmlInlineSourcePlugin(),
					new PrepackPlugin({ prepack: prepackConfig }),
					new NoEmitPlugin(),
			  ]
			: []),
	].filter(Boolean),
	resolve: {
		extensions: ['.ts'],
	},
}
