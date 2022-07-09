/// <reference types="vitest" />

import path from 'path'

import { defineConfig } from 'vite'
import checkerPlugin from 'vite-plugin-checker'
import { createHtmlPlugin } from 'vite-plugin-html'
import { viteSingleFile } from 'vite-plugin-singlefile'

const checker = checkerPlugin({
	overlay: { initialIsOpen: false },
	typescript: true,
	eslint: {
		lintCommand: 'eslint "./src/**/*.ts"',
		dev: { logLevel: ['error'] },
	},
})

export default defineConfig({
	build: { sourcemap: true },
	plugins: import.meta.vitest
		? []
		: [checker, viteSingleFile(), createHtmlPlugin()],
	resolve: { alias: { '~': path.resolve(__dirname, './src') } },
	test: {
		include: ['src/**/*.test.ts'],
		includeSource: ['src/**/*.ts'],
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
	},
})
