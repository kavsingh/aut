import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { checker as checkerPlugin } from "vite-plugin-checker"
import deadFilePlugin from "vite-plugin-deadfile"
import glslPlugin from "vite-plugin-glsl"
import { createHtmlPlugin } from "vite-plugin-html"
import { viteSingleFile } from "vite-plugin-singlefile"
import solidPlugin from "vite-plugin-solid"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
	return {
		plugins: [
			tsConfigPaths(),
			glslPlugin({
				include: [
					"**/*.glsl",
					"**/*.wgsl",
					"**/*.vert",
					"**/*.frag",
					"**/*.vs",
					"**/*.fs",
				],
			}),
			solidPlugin(),
			tailwindcss(),
			checker(mode),
			viteSingleFile(),
			createHtmlPlugin(),
			deadfiles(mode),
		],
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
