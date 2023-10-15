/// <reference types="vitest" />

import { defineConfig } from "vite"
import checkerPlugin from "vite-plugin-checker"
import { createHtmlPlugin } from "vite-plugin-html"
import { viteSingleFile } from "vite-plugin-singlefile"
import tsConfigPaths from "vite-tsconfig-paths"

import type { PluginOption } from "vite"

export default defineConfig(({ mode }) => {
	return {
		plugins: [
			tsConfigPaths(),
			checker(mode),
			viteSingleFile(),
			createHtmlPlugin(),
		] as PluginOption[],
		deps: { optimizer: { web: { include: ["vitest-canvas-mock"] } } },
		test: {
			include: ["src/**/*.test.ts"],
			includeSource: ["src/**/*.ts"],
			environment: "jsdom",
			setupFiles: ["./vitest.setup.ts"],
			environmentOptions: { jsdom: { resources: "usable" } },
		},
	}
})

function checker(mode: string) {
	if (mode !== "development") return undefined

	return checkerPlugin({
		overlay: { initialIsOpen: false },
		typescript: true,
		eslint: {
			lintCommand: 'eslint "./src/**/*.ts"',
			dev: { logLevel: ["error"] },
		},
	})
}
