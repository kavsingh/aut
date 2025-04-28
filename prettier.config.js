/** @type {import('prettier').Config} */
export default {
	semi: false,
	useTabs: true,
	quoteProps: "consistent",
	plugins: ["prettier-plugin-tailwindcss"],
	tailwindFunctions: ["tv", "twJoin", "twMerge"],
}
