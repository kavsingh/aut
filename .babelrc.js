module.exports = {
  presets: [
    [
      'env',
      {
        modules: false,
        useBuiltIns: 'usage',
        loose: true,
        targets: {
          browsers: ['last 2 versions'],
        },
      },
    ],
  ],
  env: {
    test: {
      plugins: ['transform-es2015-modules-commonjs'],
    },
  },
}
