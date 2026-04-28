import { defineConfig, defineProject, mergeConfig } from "vitest/config"

import baseConfig from "./vite.config.ts"

import type { ViteUserConfig } from "vitest/config"

export default defineConfig((configEnv) => {
	return {
		test: {
			clearMocks: true,
			expect: { requireAssertions: true },
			coverage: { provider: "v8", reportsDirectory: "./reports/coverage" },
			projects: [
				mergeConfig(
					baseConfig(configEnv),
					defineProject({
						resolve: { conditions: ["development", "browser"] },
						test: {
							name: "app",
							environment: "jsdom",
							setupFiles: ["./src/vitest.setup.ts"],
							include: ["src/**/*.test.{ts,tsx}"],
							includeSource: ["src/**/*.{ts,tsx}"],
						},
					}),
				),
			],
		},
	} satisfies ViteUserConfig
})
