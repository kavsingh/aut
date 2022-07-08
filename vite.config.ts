/// <reference types="vitest" />

import path from 'path'

import legacyPlugin from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'
import checkerPlugin from 'vite-plugin-checker'

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
	plugins: [checker, legacyPlugin()],
	resolve: { alias: { '~': path.resolve(__dirname, './src') } },
	test: {
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
	},
})
