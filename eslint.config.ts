import path from "node:path"

import jsPlugin from "@eslint/js"
import filenamesPlugin from "@kavsingh/eslint-plugin-filenames"
import importPlugin from "eslint-plugin-import-x"
// @ts-expect-error no types available
import jestDomPlugin from "eslint-plugin-jest-dom"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import solidPlugin from "eslint-plugin-solid"
// @ts-expect-error no types available
import tailwindPlugin from "eslint-plugin-tailwindcss"
// @ts-expect-error no types available
import testingPlugin from "eslint-plugin-testing-library"
import vitestPlugin from "eslint-plugin-vitest"
import globals from "globals"
import * as tsEslintPlugin from "typescript-eslint"

const testFileSuffixes = ["test", "spec", "mock"]

function testFilePatterns({ root = "", extensions = "?([mc])[tj]s?(x)" } = {}) {
	return [
		`*.{${testFileSuffixes.join(",")}}`,
		"__{test,tests,mocks,fixtures}__/**/*",
		"__{test,mock,fixture}-*__/**/*",
	].map((pattern) => path.join(root, `**/${pattern}.${extensions}`))
}

export default tsEslintPlugin.config(
	{
		ignores: [
			".vscode/*",
			"dist/*",
			"coverage/*",
			"reports/*",
			"**/__generated__/*",
		],
	},

	{
		linterOptions: { reportUnusedDisableDirectives: true },
		languageOptions: {
			globals: { ...globals.node },
			parserOptions: { projectService: true },
		},
	},

	jsPlugin.configs.recommended,
	...tsEslintPlugin.configs.strictTypeChecked,
	...tsEslintPlugin.configs.stylisticTypeChecked,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	filenamesPlugin.configs.kebab,

	{
		settings: {
			"import-x/resolver": {
				"eslint-import-resolver-typescript": { projectService: true },
			},
		},
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
				"warn",
				{
					args: "all",
					argsIgnorePattern: "^_",
					caughtErrors: "all",
					caughtErrorsIgnorePattern: "^_",
					destructuredArrayIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					ignoreRestSiblings: true,
				},
			],
			"import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
			"import-x/no-cycle": "error",
			"import-x/no-self-import": "error",
			"import-x/no-unused-modules": "error",
			"import-x/no-useless-path-segments": "error",
			"import-x/order": [
				"warn",
				{
					"alphabetize": { order: "asc" },
					"groups": [
						"builtin",
						"external",
						"internal",
						"parent",
						["sibling", "index"],
						"type",
					],
					"pathGroupsExcludedImportTypes": ["type"],
					"newlines-between": "always",
				},
			],
		},
	},

	{
		files: ["**/*.c[tj]s?(x)"],
		languageOptions: {
			sourceType: "commonjs",
			parserOptions: { sourceType: "commonjs" },
		},
		rules: {
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/no-var-requires": "off",
		},
	},

	{
		files: ["**/*.?([mc])js?(x)"],
		extends: [tsEslintPlugin.configs.disableTypeChecked],
	},

	{
		files: ["*.?([mc])[tj]s?(x)"],
		rules: {
			"filenames/match-exported": "off",
		},
	},

	{
		files: ["src/**/*.?([mc])[tj]s?(x)"],
		languageOptions: { globals: { ...globals.browser } },
		settings: {
			tailwindcss: {
				callees: ["tv", "twMerge", "class", "classList"],
			},
		},
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		extends: [
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			...tailwindPlugin.configs["flat/recommended"],
			solidPlugin.configs["flat/recommended"],
		],
		rules: {
			"no-console": "error",
		},
	},

	{
		files: testFilePatterns(),
		languageOptions: { globals: { ...globals.node } },
		rules: {
			"no-console": "off",
			"filenames/match-exported": [
				"error",
				{
					transforms: ["kebab"],
					remove: `\\.(${testFileSuffixes.join("|")})$`,
				},
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
		languageOptions: { globals: { ...globals.node, ...globals.browser } },
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		extends: [
			vitestPlugin.configs.all,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			testingPlugin.configs.recommended,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			jestDomPlugin.configs["flat/recommended"],
		],
		rules: {
			"vitest/no-hooks": "off",
		},
	},

	eslintPluginPrettierRecommended,
)
