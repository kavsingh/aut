import { WorldState } from '../types'

export interface RendererFactoryOptions {
	width?: number
	height?: number
	cellDim?: number
	fillColor?: string
	fillMode?: 'active' | 'inactive'
}

export type Renderer = (state: WorldState) => void

export type RendererFactory = (
	canvases: HTMLCanvasElement[],
	options: RendererFactoryOptions,
) => Renderer
