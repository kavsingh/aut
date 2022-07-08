import type { WorldState } from '../types'

export type RenderFn = (state: WorldState) => void

export interface RendererFactoryOptions {
	width?: number
	height?: number
	cellDim?: number
	fillColor?: string
	fillMode?: 'active' | 'inactive'
}

type RendererFactory<T> = (
	renderTargets: T[],
	options: RendererFactoryOptions,
) => RenderFn

export type CanvasRendererFactory = RendererFactory<HTMLCanvasElement>

export type SvgRendererFactory = RendererFactory<SVGElement>
