import { last, head, groupIndecesBy, eq } from './util'
import { WorldState } from './types'

const isNonNull2dContext = (
	context: unknown,
): context is CanvasRenderingContext2D => !!context

export function createCanvasRenderer(
	canvases: HTMLCanvasElement[],
	{
		width = 200,
		height = 200,
		cellDim = 2,
		fillColor = '#000000',
		fillMode = 'active',
	} = {},
) {
	const contexts = canvases
		.map(canvas => canvas.getContext('2d'))
		.filter(isNonNull2dContext)
	const maxRows = Math.floor(height / cellDim)
	const groupFillRanges = groupIndecesBy(eq(fillMode === 'inactive' ? 0 : 1))

	const clear = () =>
		contexts.forEach(context => {
			context.clearRect(0, 0, width, height)
			context.fillStyle = fillColor
		})

	const drawRow = (row: number[], yOffset: number) => {
		const fillRanges = groupFillRanges(row)

		for (let i = 0; i < fillRanges.length; i++) {
			const current = fillRanges[i]
			const start = head<number>(current)
			const end = last(current)

			if (start !== undefined && end !== undefined) {
				contexts.forEach(context => {
					context.fillRect(
						start * cellDim,
						yOffset,
						current.length * cellDim,
						cellDim,
					)
				})
			}
		}
	}

	canvases.forEach(canvas => Object.assign(canvas, { width, height }))

	return (state: WorldState) => {
		clear()

		const startIdx = Math.max(0, state.length - maxRows)

		for (let i = startIdx; i < state.length; i++) {
			drawRow(state[i], height - (state.length - i) * cellDim)
		}
	}
}
