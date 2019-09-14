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
    ],
})
