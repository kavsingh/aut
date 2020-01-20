import { last, head, groupIndecesBy, eq } from '../util'
import { CanvasRendererFactory } from './types'

const is2dContext = (context: unknown): context is CanvasRenderingContext2D =>
	context && context instanceof CanvasRenderingContext2D

export const createRenderer: CanvasRendererFactory = (
	canvases,
	{
		width = 200,
		height = 200,
		cellDim = 2,
		fillColor = '#000000',
		fillMode = 'active',
	},
) => {
	const [drawingCanvas, ...targetCanvases] = canvases
	const drawingContext = drawingCanvas.getContext('2d')
	const targetContexts = targetCanvases
		.map(canvas => canvas.getContext('2d'))
		.filter(is2dContext)

	if (!is2dContext(drawingContext)) {
		throw new Error('could not create drawing context')
	}

	const maxRows = Math.floor(height / cellDim)
	const groupFillRanges = groupIndecesBy<number>(
		eq(fillMode === 'inactive' ? 0 : 1),
	)

	const clear = () => {
		;[drawingContext, ...targetContexts].forEach(context => {
			context.clearRect(0, 0, width, height)
			context.fillStyle = fillColor
		})
	}

	const drawRow = (row: number[], yOffset: number) => {
		const fillRanges = groupFillRanges(row)

		for (let i = 0; i < fillRanges.length; i++) {
			const current = fillRanges[i]
			const start = head(current)
			const end = last(current)

			if (start !== undefined && end !== undefined) {
				drawingContext.fillRect(
					start * cellDim,
					yOffset,
					current.length * cellDim,
					cellDim,
				)
			}
		}
	}

	Object.assign(drawingCanvas, { width, height })
	canvases.forEach(canvas => Object.assign(canvas, { width, height }))

	return state => {
		clear()

		const startIdx = Math.max(0, state.length - maxRows)

		for (let i = startIdx; i < state.length; i++) {
			drawRow(state[i], height - (state.length - i) * cellDim)
		}

		targetContexts.forEach(context => context.drawImage(drawingCanvas, 0, 0))
	}
}
