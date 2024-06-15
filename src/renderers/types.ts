import type { WorldState } from "#lib/types"

export type RenderFn = (state: WorldState) => void

export type RendererFactoryOptions = {
	width?: number
	height?: number
	cellDim?: number
	fillColor?: string
	fillMode?: "active" | "inactive"
}

export type RendererFactory<T> = (
	renderTargets: T[],
	options: RendererFactoryOptions,
) => RenderFn
