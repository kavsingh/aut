import containerQueriesPlugin from "@tailwindcss/container-queries"

import type { Config } from "tailwindcss"

export default {
	content: ["./index.html", "./src/**/*.{tsx,ts}"],
	theme: {
		extend: {
			screens: { fs: { raw: "(display-mode: fullscreen)" } },
		},
	},
	plugins: [containerQueriesPlugin],
} satisfies Config
