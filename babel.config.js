module.exports = ({ env }) => ({
	presets: [
		[
			'@babel/preset-env',
			{
				corejs: 3,
				modules: env('test') ? 'commonjs' : false,
				shippedProposals: true,
				useBuiltIns: 'usage',
			},
		],
		'@babel/preset-typescript',
	],
	plugins: [['@babel/plugin-transform-runtime', { regenerator: true }]],
})
