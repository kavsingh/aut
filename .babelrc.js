module.exports = {
  presets: [
    [
      'env',
      {
        modules: false,
        useBuiltIns: 'usage',
        loose: true,
      },
    ],
  ],
  env: {
    test: {
      plugins: ['transform-es2015-modules-commonjs'],
    },
  },
}
