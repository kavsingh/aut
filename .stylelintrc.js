module.exports = {
  extends: [
    "stylelint-config-standard",
    "stylelint-prettier/recommended",
    "stylelint-config-rational-order-fix",
  ],
  plugins: [
    "stylelint-use-logical-spec",
    "stylelint-value-no-unknown-custom-properties",
  ],
  rules: {
    "csstools/value-no-unknown-custom-properties": [
      true,
      { "importFrom": ["src/style/theme.css"] },
    ],
    "liberty/use-logical-spec": "always",
  },
};
