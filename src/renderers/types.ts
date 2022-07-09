import type { WorldState } from '../types'

export type RenderFn = (state: WorldState) => void

export interface RendererFactoryOptions {
	width?: number
	height?: number
	cellDim?: number
	fillColor?: string
	fillMode?: 'active' | 'inactive'
}

export type RendererFactory<T> = (
	renderTargets: T[],
	options: RendererFactoryOptions,
) => RenderFn
