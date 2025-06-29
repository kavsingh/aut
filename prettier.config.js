/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
export default {
	semi: false,
	useTabs: true,
	quoteProps: "consistent",
	plugins: ["prettier-plugin-tailwindcss"],
	tailwindFunctions: ["tj", "tm", "tv"],
	tailwindStylesheet: "./src/index.css",
}
