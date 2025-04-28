import type { WorldState } from "#lib/types"

export type RenderFn = (state: WorldState) => void

export interface RendererFactoryOptions {
	width?: number | undefined
	height?: number | undefined
	cellDim?: number | undefined
	fillColor?: string | undefined
	fillMode?: "active" | "inactive" | undefined
}

export type RendererFactory<T> = (
	renderTargets: T[],
	options: RendererFactoryOptions,
) => RenderFn
