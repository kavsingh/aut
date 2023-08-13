import { last, head, groupIndecesBy, eq } from "../lib/util"

import type { RendererFactory } from "./types"

export const createRenderer: CanvasRendererFactory = (
	canvases,
	{
		width = 200,
		height = 200,
		cellDim = 2,
		fillColor = "#000000",
		fillMode = "active",
	},
) => {
	const [drawingCanvas, ...targetCanvases] = canvases

	if (!drawingCanvas) throw new Error("no canvas provided")

	const drawingContext = drawingCanvas.getContext("2d")
	const targetContexts = targetCanvases
		.map((canvas) => canvas.getContext("2d"))
		.filter(is2dContext)

	if (!is2dContext(drawingContext)) {
		throw new Error("could not create drawing context")
	}

	const allContexts = [drawingContext, ...targetContexts]
	const groupFillRanges = groupIndecesBy<number>(
		eq(fillMode === "inactive" ? 0 : 1),
	)

	function clear() {
		for (const context of allContexts) {
			context.clearRect(0, 0, width, height)
			context.fillStyle = fillColor
		}
	}

	function drawRow(row: number[], yOffset: number) {
		for (const current of groupFillRanges(row)) {
			const start = head(current)
			const end = last(current)

			if (start !== undefined && end !== undefined) {
				drawingContext?.fillRect(
					start * cellDim,
					yOffset,
					current.length * cellDim,
					cellDim,
				)
			}
		}
	}

	Object.assign(drawingCanvas, { width, height })
	canvases.forEach((canvas) => Object.assign(canvas, { width, height }))

	return function render(state) {
		clear()

		for (let i = 0; i < state.length; i++) {
			const row = state[i]

			if (row) drawRow(row, height - (state.length - i) * cellDim)
		}

		for (const context of targetContexts) {
			context.drawImage(drawingCanvas, 0, 0)
		}
	}
}

export type CanvasRendererFactory = RendererFactory<HTMLCanvasElement>

function is2dContext(context: unknown): context is CanvasRenderingContext2D {
	return !!context && context instanceof CanvasRenderingContext2D
}
