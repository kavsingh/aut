import { defineConfig, mergeConfig } from "vitest/config"

import baseConfig from "./vite.config"

export default mergeConfig(
	baseConfig({ command: "build", mode: "test" }),
	defineConfig({
		test: {
			clearMocks: true,
			deps: { optimizer: { web: { include: ["vitest-canvas-mock"] } } },
			environment: "jsdom",
			environmentOptions: { jsdom: { resources: "usable" } },
			include: ["src/**/*.test.ts"],
			includeSource: ["src/**/*.ts"],
			setupFiles: ["./vitest.setup.ts"],
		},
	}),
)
