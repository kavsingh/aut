import { defineConfig } from "oxfmt"

export default defineConfig({
	ignorePatterns: ["**/dist/**", "**/reports/**"],
	printWidth: 80,
	useTabs: true,
	semi: false,
	sortImports: {
		order: "asc",
		groups: [
			["builtin"],
			["external"],
			["internal", "subpath"],
			["parent"],
			["sibling", "index"],
			["type"],
		],
	},
	overrides: [
		{ files: ["*.{json,jsonc}"], options: { trailingComma: "none" } },
	],
})
