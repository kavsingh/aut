import { describe, it, expect } from "vitest"

import { createRenderer } from "./renderer-canvas2d"

describe("renderer 2d", () => {
	it("should draw state to canvas context", () => {
		expect.assertions(5)

		const targetCanvas = document.createElement("canvas")
		const render = createRenderer([targetCanvas], {
			width: 10,
			height: 10,
			cellDim: 1,
		})

		render([
			[1, 0],
			[0, 1],
		])

		const drawCalls = getDrawCalls(targetCanvas)
		const clearRectCalls = getDrawCalls(targetCanvas, "clearRect")
		const fillRectCalls = getDrawCalls(targetCanvas, "fillRect")

		expect(drawCalls[0]?.type).toBe("clearRect")
		expect(clearRectCalls).toHaveLength(1)
		expect(fillRectCalls).toHaveLength(2)
		// First active, second row from bottom (state is 2 rows)
		expect(fillRectCalls[0]).toStrictEqual(
			expect.objectContaining({ props: { width: 1, height: 1, x: 0, y: 8 } }),
		)
		// Second active, first row from bottom, second column
		// (last row drawn at bottom of height)
		expect(fillRectCalls[1]).toStrictEqual(
			expect.objectContaining({ props: { width: 1, height: 1, x: 1, y: 9 } }),
		)
	})

	it("should respect draw options", () => {
		expect.assertions(3)

		const targetCanvas = document.createElement("canvas")
		const render = createRenderer([targetCanvas], {
			width: 2,
			height: 1,
			cellDim: 1,
			fillColor: "#f00",
			fillMode: "inactive",
		})

		render([[1, 0]])

		const fillRectCalls = getDrawCalls(targetCanvas, "fillRect")

		expect(targetCanvas.getContext("2d")?.fillStyle).toBe("#ff0000")
		expect(fillRectCalls).toHaveLength(1)
		expect(fillRectCalls[0]).toStrictEqual(
			expect.objectContaining({ props: { width: 1, height: 1, x: 1, y: 0 } }),
		)
	})

	it("should not draw if no active cells", () => {
		expect.assertions(1)

		const targetCanvas = document.createElement("canvas")
		const render = createRenderer([targetCanvas], {
			width: 1,
			height: 1,
			cellDim: 1,
		})

		render([[0, 0]])
		render([[]])
		render([])

		expect(getDrawCalls(targetCanvas, "fillRect")).toHaveLength(0)
	})

	it("should only draw rows to one canvas and share the result", () => {
		expect.assertions(4)

		const sourceCanvas = document.createElement("canvas")
		const secondaryCanvas = document.createElement("canvas")
		const render = createRenderer([sourceCanvas, secondaryCanvas], {
			width: 2,
			height: 1,
			cellDim: 1,
		})

		render([[1, 0]])

		const sourceFillRectCalls = getDrawCalls(sourceCanvas, "fillRect")
		const secondaryFillRectCalls = getDrawCalls(secondaryCanvas, "fillRect")
		const secondaryDrawImageCalls = getDrawCalls(secondaryCanvas, "drawImage")

		expect(sourceFillRectCalls).toHaveLength(1)
		expect(secondaryFillRectCalls).toHaveLength(0)
		expect(secondaryDrawImageCalls).toHaveLength(1)
		expect(secondaryDrawImageCalls[0]).toStrictEqual(
			expect.objectContaining({
				props: expect.objectContaining({ img: sourceCanvas }),
			}),
		)
	})
})

function getDrawCalls(canvas: HTMLCanvasElement, type?: string) {
	const allDrawCalls = (
		canvas.getContext("2d") as MockCanvasContext2d
	).__getDrawCalls()

	return type ? allDrawCalls.filter((call) => call.type === type) : allDrawCalls
}

interface MockCanvasContext2d extends CanvasRenderingContext2D {
	__getDrawCalls: () => { type: string }[]
}
