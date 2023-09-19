import containerQueriesPlugin from "@tailwindcss/container-queries"

import type { Config } from "tailwindcss"

export default {
	content: ["./index.html", "./src/**/*.ts"],
	theme: {
		extend: {
			screens: { fs: { raw: "(display-mode: fullscreen)" } },
		},
	},
	plugins: [
		// @ts-expect-error exactOptionalProperties conflict
		containerQueriesPlugin,
	],
} satisfies Config
