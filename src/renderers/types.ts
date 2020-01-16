import { WorldState } from '../types'

type RendererFactory<T> = (
	renderTargets: T[],
	options: {
		width?: number
		height?: number
		cellDim?: number
		fillColor?: string
		fillMode?: 'active' | 'inactive'
	},
) => (state: WorldState) => void

export type CanvasRendererFactory = RendererFactory<HTMLCanvasElement>

export type SvgRendererFactory = RendererFactory<SVGElement>
