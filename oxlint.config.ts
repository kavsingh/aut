import path from "node:path"

import tailwindcss from "eslint-plugin-better-tailwindcss"
import { getDefaultSelectors } from "eslint-plugin-better-tailwindcss/defaults"
import {
	SelectorKind,
	MatcherType,
} from "eslint-plugin-better-tailwindcss/types"
import jestDom from "eslint-plugin-jest-dom"
import solid from "eslint-plugin-solid"
import testingLibrary from "eslint-plugin-testing-library"
import { defineConfig } from "oxlint"

export default defineConfig({
	options: {
		typeAware: true,
		typeCheck: true,
		maxWarnings: 0,
		reportUnusedDisableDirectives: "error",
	},
	ignorePatterns: [".vscode/*", "**/dist/*", "**/reports/*"],
	plugins: ["oxc", "eslint", "typescript", "import", "promise", "unicorn"],
	categories: {
		correctness: "error",
		suspicious: "error",
		pedantic: "error",
		restriction: "error",
		perf: "error",
		style: "error",
		nursery: "error",
	},
	env: { node: true },
	settings: {
		"jsx-a11y": {
			attributes: { for: ["for"] },
			components: { Link: "a" },
		},

		"better-tailwindcss": {
			entryPoint: path.join(import.meta.dirname, "./src/index.css"),
			selectors: [
				...getDefaultSelectors(),
				...["tj", "tm"].map((name) => ({
					name,
					kind: SelectorKind.Callee,
					match: [{ type: MatcherType.String }],
				})),
				...["^classNames$", "^.+ClassName$", "^.+ClassNames$"].map((name) => ({
					name,
					kind: SelectorKind.Attribute,
					match: [
						{ type: MatcherType.String },
						{ type: MatcherType.ObjectValue },
					],
				})),
				{
					name: "^.+ClassName$",
					kind: SelectorKind.Variable,
					match: [{ type: MatcherType.String }],
				},
				{
					name: "^.+ClassNames$",
					kind: SelectorKind.Variable,
					match: [
						{ type: MatcherType.String },
						{ type: MatcherType.ObjectValue },
					],
				},
			],
		},

		vitest: { typecheck: true },
	},
	rules: {
		"oxc/no-async-await": "off",
		"oxc/no-optional-chaining": "off",
		"oxc/no-rest-spread-properties": "off",

		"eslint/arrow-body-style": "off",
		"eslint/capitalized-comments": "off",
		"eslint/curly": ["error", "multi-line", "consistent"],
		"eslint/eqeqeq": "error",
		"eslint/id-length": "off",
		"eslint/func-style": "off",
		"eslint/max-classes-per-file": "off",
		"eslint/max-lines-per-function": "off",
		"eslint/max-statements": "off",
		"eslint/new-cap": "off",
		"eslint/no-console": "off",
		"eslint/no-continue": "off",
		"eslint/no-duplicate-imports": [
			"error",
			{ allowSeparateTypeImports: true },
		],
		"eslint/no-implicit-coercion": ["error", { allow: ["!!"] }],
		"eslint/no-inline-comments": ["error", { ignorePattern: "@type" }],
		"eslint/no-magic-numbers": "off",
		"eslint/no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
		"eslint/no-restricted-imports": [
			"error",
			{
				paths: [
					{
						name: "tailwind-merge",
						message: "please import helpers from ~/src/lib/style",
					},
					{
						name: "tailwind-variants",
						message: "please import helpers from ~/src/lib/style",
					},
				],
			},
		],
		"eslint/no-ternary": "off",
		"eslint/no-undefined": "off",
		"eslint/no-underscore-dangle": "off",
		"eslint/no-unused-vars": [
			"error",
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
		"eslint/no-void": ["error", { allowAsStatement: true }],
		"eslint/no-warning-comments": ["error", { terms: ["fixme", "revert"] }],
		"eslint/prefer-destructuring": "off",
		"eslint/sort-imports": "off",
		"eslint/sort-keys": "off",

		"typescript/explicit-member-accessibility": "off",
		"typescript/explicit-module-boundary-types": "off",
		"typescript/consistent-type-imports": [
			"error",
			{
				fixStyle: "separate-type-imports",
				prefer: "type-imports",
			},
		],
		"typescript/explicit-function-return-type": "off",
		"typescript/no-non-null-assertion": "error",
		"typescript/prefer-readonly-parameter-types": "off",
		"typescript/promise-function-async": "off",
		"typescript/restrict-template-expressions": [
			"error",
			{ allowNumber: true },
		],
		"typescript/strict-boolean-expressions": "off",
		"typescript/switch-exhaustiveness-check": [
			"error",
			{
				allowDefaultCaseForExhaustiveSwitch: true,
				considerDefaultExhaustiveForUnions: true,
				requireDefaultForNonUnion: true,
			},
		],

		"import/group-exports": "off",
		"import/extensions": "off",
		"import/max-dependencies": "off",
		"import/no-default-export": "error",
		"import/no-named-export": "off",
		"import/no-nodejs-modules": "off",
		"import/no-unassigned-import": ["error", { allow: ["**/*.css"] }],
		"import/prefer-default-export": "off",

		"promise/always-return": ["error", { ignoreLastCallback: true }],

		"unicorn/catch-error-name": ["error", { name: "cause" }],
		"unicorn/no-array-callback-reference": "off",
		"unicorn/no-array-reduce": "off",
		"unicorn/no-null": "off",
		"unicorn/no-useless-undefined": "off",
		"unicorn/prefer-spread": "off",
	},
	overrides: [
		{
			files: ["**/typings/*.d.ts"],
			rules: {
				"import/unambiguous": "off",
			},
		},

		{
			files: ["*.config.{js,ts}"],
			rules: {
				"import/no-default-export": "off",
				"import/no-anonymous-default-export": "off",
			},
		},

		{
			files: ["src/**"],
			env: { browser: true, node: false },
			jsPlugins: ["eslint-plugin-solid", "eslint-plugin-better-tailwindcss"],
			rules: {
				"import/no-nodejs-modules": "error",

				...solid.configs["flat/typescript"].rules,

				...tailwindcss.configs["recommended-error"].rules,
				"better-tailwindcss/enforce-consistent-line-wrapping": "off",
				"better-tailwindcss/enforce-logical-properties": "error",
			},
		},

		{
			files: [
				"**/vitest.*.setup.ts",
				"**/*.test.*",
				"**/*.test-*.*",
				"**/*__{mock,mocks,test,test-*,tests,fixtures}__/**/*",
			],
			env: { browser: true, node: true },
			// @TODO: omitting this causes rule overrides to be ignored. why?
			plugins: ["eslint", "import", "typescript", "promise"],
			rules: {
				"eslint/max-lines": "off",
				"eslint/max-lines-per-function": "off",
				"eslint/max-statements": "off",
				"eslint/no-new": "off",
				"eslint/no-console": "off",
				"eslint/no-constructor-return": "off",
				"eslint/no-promise-executor-return": "off",

				"import/no-namespace": "off",

				"typescript/ban-types": "off",
				"typescript/consistent-type-assertions": "off",
				"typescript/no-explicit-any": "off",
				"typescript/no-non-null-assertion": "off",
				"typescript/no-unsafe-argument": "off",
				"typescript/no-unsafe-assignment": "off",
				"typescript/no-unsafe-call": "off",
				"typescript/no-unsafe-function-type": "off",
				"typescript/no-unsafe-member-access": "off",
				"typescript/no-unsafe-return": "off",
				"typescript/no-unsafe-type-assertion": "off",
				"typescript/unbound-method": "off",

				"promise/catch-or-return": "off",
				"promise/prefer-await-to-callbacks": "off",
				"promise/prefer-await-to-then": "off",
			},
		},

		{
			files: ["src/**/*.test.*"],
			env: { browser: true, node: true },
			plugins: ["vitest"],
			jsPlugins: ["eslint-plugin-jest-dom", "eslint-plugin-testing-library"],
			rules: {
				"vitest/no-disabled-tests": "error",
				"vitest/no-focused-tests": "error",
				"vitest/no-hooks": "off",
				"vitest/no-importing-vitest-globals": "off",
				"vitest/prefer-to-be-falsy": "off",
				"vitest/prefer-to-be-truthy": "off",
				"vitest/require-mock-type-parameters": "off",
				"vitest/require-test-timeout": "off",

				...jestDom.configs["flat/recommended"].rules,
				...testingLibrary.configs["flat/dom"].rules,
			},
		},
	],
})
