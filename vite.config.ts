import { defineConfig } from "vite"
import { checker as checkerPlugin } from "vite-plugin-checker"
import deadFilePlugin from "vite-plugin-deadfile"
import { createHtmlPlugin } from "vite-plugin-html"
import { viteSingleFile } from "vite-plugin-singlefile"
import solidPlugin from "vite-plugin-solid"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
	return {
		plugins: [
			tsConfigPaths(),
			solidPlugin(),
			checker(mode),
			viteSingleFile(),
			createHtmlPlugin(),
			deadfiles(mode),
		].filter(Boolean),
	}
})

function deadfiles(mode: string) {
	if (mode !== "production") return undefined

	return deadFilePlugin({
		root: "src",
		exclude: ["**/__test__/**", "**/*.test.*", "**/*.d.ts"],
	})
}

function checker(mode: string) {
	if (mode !== "development") return undefined

	return checkerPlugin({
		overlay: { initialIsOpen: false },
		typescript: true,
	})
}
