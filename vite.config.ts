import tailwindcss from "@tailwindcss/vite"
import typegpu from "unplugin-typegpu/vite"
import { defineConfig } from "vite"
import { checker } from "vite-plugin-checker"
import { createHtmlPlugin as createHtml } from "vite-plugin-html"
import { viteSingleFile } from "vite-plugin-singlefile"
import solid from "vite-plugin-solid"

export default defineConfig(({ mode }) => {
	return {
		resolve: { tsconfigPaths: true },
		oxc: { jsx: { importSource: "solid-js" } },
		plugins: [
			solid(),
			tailwindcss(),
			typegpu(),
			mode === "development"
				? checker({ oxlint: true, overlay: { initialIsOpen: false } })
				: undefined,
			mode === "production" ? [viteSingleFile(), createHtml()] : undefined,
		],
	}
})
