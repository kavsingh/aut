module.exports = ({ env }) => ({
	presets: [
		[
			'@babel/preset-env',
			{
				loose: true,
				shippedProposals: true,
				...(env('test')
					? { modules: 'commonjs', useBuiltIns: false }
					: { modules: false, useBuiltIns: 'usage', corejs: 3 }),
			},
		],
		'@babel/preset-typescript',
	],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		['@babel/plugin-transform-runtime', { regenerator: true }],
		// TODO: remove these when included with preset-env
		'@babel/plugin-proposal-optional-chaining',
		'@babel/plugin-proposal-nullish-coalescing-operator',
	],
})
