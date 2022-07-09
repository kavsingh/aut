/// <reference types="vite/client" />
/// <reference types="vitest/importMeta" />

declare module "*.vert" {
	const shaderContent: string

	export default shaderContent
}

declare module "*.frag" {
	const shaderContent: string

	export default shaderContent
}
