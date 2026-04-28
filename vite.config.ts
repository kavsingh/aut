import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { checker } from "vite-plugin-checker"
import { createHtmlPlugin } from "vite-plugin-html"
import { viteSingleFile } from "vite-plugin-singlefile"
import solidPlugin from "vite-plugin-solid"

export default defineConfig(({ mode }) => {
	return {
		resolve: { tsconfigPaths: true },
		oxc: { jsx: { importSource: "solid-js" } },
		plugins: [
			solidPlugin(),
			tailwindcss(),
			mode === "development"
				? checker({ oxlint: true, overlay: { initialIsOpen: false } })
				: undefined,
			viteSingleFile(),
			createHtmlPlugin(),
		],
	}
})
