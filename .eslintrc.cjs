/** @type {import("node:path")} */
const path = require("node:path")

const vitest = require("eslint-plugin-vitest")
/** @type {import("typescript")} */
const ts = require("typescript")

const testFileSuffixes = ["test", "spec", "mock"]

const srcDependencies = {
	devDependencies: false,
	optionalDependencies: false,
	peerDependencies: false,
}

const devDependencies = {
	devDependencies: true,
	optionalDependencies: false,
	peerDependencies: false,
}

/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
	root: true,
	reportUnusedDisableDirectives: true,
	env: { es2022: true, node: true, browser: false },
	parser: "@typescript-eslint/parser",
	parserOptions: { project: "./tsconfig.json" },
	settings: {
		"import-x/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
		"import-x/resolver": {
			"eslint-import-resolver-typescript": { project: "./tsconfig.json" },
		},
	},
	plugins: ["filenames", "deprecation"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/strict-type-checked",
		"plugin:@typescript-eslint/stylistic-type-checked",
		"plugin:import-x/recommended",
		"plugin:import-x/typescript",
		"plugin:prettier/recommended",
	],
	rules: {
		"camelcase": "off",
		"curly": ["warn", "multi-line", "consistent"],
		"no-console": "off",
		"no-restricted-syntax": [
			"warn",
			{ selector: "TSEnumDeclaration", message: "Avoid using enums" },
		],
		"no-unreachable": "error",
		"@typescript-eslint/consistent-type-definitions": ["warn", "type"],
		"@typescript-eslint/consistent-type-imports": "error",
		"@typescript-eslint/member-ordering": ["warn"],
		"@typescript-eslint/restrict-template-expressions": [
			"error",
			{ allowNumber: true },
		],
		"no-shadow": "off",
		"@typescript-eslint/no-shadow": [
			"error",
			{
				ignoreTypeValueShadow: false,
				ignoreFunctionTypeParameterNameValueShadow: true,
			},
		],
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
		],
		"filenames/match-regex": ["error", "^[a-z0-9-.]+$", true],
		"filenames/match-exported": ["error", "kebab"],
		"import-x/no-cycle": "error",
		"import-x/no-self-import": "error",
		"import-x/no-unused-modules": "error",
		"import-x/no-useless-path-segments": "error",
		"import-x/no-extraneous-dependencies": ["error", devDependencies],
		"import-x/order": getImportOrderConfig("tsconfig.json"),
		"deprecation/deprecation": "warn",
		"prettier/prettier": "warn",
	},
	overrides: [
		{
			files: ["*.c[jt]s"],
			parserOptions: { sourceType: "script" },
			rules: {
				"@typescript-eslint/no-require-imports": "off",
				"@typescript-eslint/no-var-requires": "off",
			},
		},
		{
			files: ["*.?(c)js"],
			extends: ["plugin:@typescript-eslint/disable-type-checked"],
			rules: { "deprecation/deprecation": "off" },
		},
		{
			files: ["./*"],
			rules: { "filenames/match-exported": "off" },
		},
		{
			files: ["src/**/*"],
			env: { node: false, browser: true },
			settings: { tailwindcss: { callees: ["twMerge", "twJoin"] } },
			extends: ["plugin:tailwindcss/recommended", "plugin:solid/typescript"],
			rules: {
				"no-console": "error",
				"import-x/no-extraneous-dependencies": ["error", srcDependencies],
			},
		},
		{
			files: testFilePatterns(),
			env: { node: true },
			rules: {
				"no-console": "off",
				"import-x/no-extraneous-dependencies": ["error", devDependencies],
				"filenames/match-exported": [
					"error",
					"kebab",
					`\\.(${testFileSuffixes.join("|")})$`,
				],
				"@typescript-eslint/no-explicit-any": "off",
				"@typescript-eslint/no-non-null-assertion": "off",
				"@typescript-eslint/no-unsafe-argument": "off",
				"@typescript-eslint/no-unsafe-assignment": "off",
				"@typescript-eslint/no-unsafe-call": "off",
				"@typescript-eslint/no-unsafe-member-access": "off",
				"@typescript-eslint/no-unsafe-return": "off",
				"@typescript-eslint/unbound-method": "off",
			},
		},
		{
			files: testFilePatterns({ root: "src" }),
			env: { node: true },
			plugins: ["vitest"],
			extends: ["plugin:testing-library/dom", "plugin:jest-dom/recommended"],
			rules: {
				// @ts-expect-error type import mismatch
				...vitest.configs.all.rules,
				"vitest/no-hooks": "off",
			},
		},
	],
}

/**
 * @typedef {object} PatternsConfig
 * @prop {string} [root]
 * @prop {string} [extensions]
 *
 * @param {PatternsConfig} [config]
 */
function testFilePatterns({ root = "", extensions = "*" } = {}) {
	return [
		`*.{${testFileSuffixes.join(",")}}`,
		"__{test,tests,mocks,fixtures}__/**/*",
		"__{test,mock,fixture}-*__/**/*",
	].map((pattern) => path.join(root, `**/${pattern}.${extensions}`))
}

/** @param {string} configPath */
function getImportOrderConfig(configPath) {
	const parsed = path.parse(path.resolve(__dirname, configPath))

	const tsconfigFile = ts.findConfigFile(
		parsed.dir,
		ts.sys.fileExists,
		parsed.base,
	)

	const configContents = tsconfigFile
		? ts.readConfigFile(tsconfigFile, ts.sys.readFile)
		: undefined

	const pathAliases = Object.keys(
		configContents?.config?.compilerOptions?.paths ?? {},
	)

	return [
		"warn",
		{
			"groups": [
				"builtin",
				"external",
				"internal",
				"parent",
				["sibling", "index"],
				"type",
			],
			"pathGroups": pathAliases.map((pattern) => ({
				pattern,
				group: "internal",
			})),
			"pathGroupsExcludedImportTypes": ["type"],
			"alphabetize": { order: "asc" },
			"newlines-between": "always",
		},
	]
}
