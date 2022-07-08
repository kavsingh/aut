const path = require('path')

const HtmlInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const NoEmitPlugin = require('no-emit-webpack-plugin')
const { default: PrepackPlugin } = require('prepack-webpack-plugin')

const prepackConfig = require('./prepack.config')

const fromRoot = path.resolve.bind(path, __dirname)
const publicPath = '/'

module.exports = ({ production }) => ({
	mode: production ? 'production' : 'development',
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
			scriptLoading: 'blocking',
			minify: production
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
		...(production
			? [
					new HtmlInlineSourcePlugin(HtmlPlugin),
					new PrepackPlugin({ prepack: prepackConfig }),
					new NoEmitPlugin(),
			  ]
			: []),
	].filter(Boolean),
	resolve: {
		extensions: ['.js', '.ts'],
	},
})
