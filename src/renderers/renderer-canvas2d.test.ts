import { createRenderer } from './renderer-canvas2d'

const getDrawCalls = (canvas: HTMLCanvasElement, type?: string) => {
	const allDrawCalls = (
		canvas.getContext('2d') as MockCanvasContext2d
	).__getDrawCalls()

	return type ? allDrawCalls.filter((call) => call.type === type) : allDrawCalls
}

describe('Renderer 2d', () => {
	it('Should draw state to canvas context', () => {
		const targetCanvas = document.createElement('canvas')
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
		const clearRectCalls = getDrawCalls(targetCanvas, 'clearRect')
		const fillRectCalls = getDrawCalls(targetCanvas, 'fillRect')

		expect(drawCalls[0]?.type).toBe('clearRect')
		expect(clearRectCalls).toHaveLength(1)
		expect(fillRectCalls).toHaveLength(2)
		// First active, second row from bottom (state is 2 rows)
		expect(fillRectCalls[0]).toEqual(
			expect.objectContaining({ props: { width: 1, height: 1, x: 0, y: 8 } }),
		)
		// Second active, first row from bottom, second column
		// (last row drawn at bottom of height)
		expect(fillRectCalls[1]).toEqual(
			expect.objectContaining({ props: { width: 1, height: 1, x: 1, y: 9 } }),
		)
	})

	it('Should draw only visible rows from state', () => {
		const targetCanvas = document.createElement('canvas')
		const render = createRenderer([targetCanvas], {
			width: 10,
			height: 4,
			cellDim: 2,
		})

		render([
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
			[1, 0, 0],
			[0, 1, 1],
		])

		const fillRectCalls = getDrawCalls(targetCanvas, 'fillRect')

		// Draw only visible state
		// height 4, cell height 2 => 2 rows visible
		// last visible row has 2 adjacent active slots, so draw once
		expect(fillRectCalls).toHaveLength(2)
		expect(fillRectCalls[0]).toEqual(
			expect.objectContaining({ props: { width: 2, height: 2, x: 0, y: 0 } }),
		)
		expect(fillRectCalls[1]).toEqual(
			expect.objectContaining({ props: { width: 4, height: 2, x: 2, y: 2 } }),
		)
	})

	it('Should respect draw options', () => {
		const targetCanvas = document.createElement('canvas')
		const render = createRenderer([targetCanvas], {
			width: 2,
			height: 1,
			cellDim: 1,
			fillColor: '#f00',
			fillMode: 'inactive',
		})

		render([[1, 0]])

		const fillRectCalls = getDrawCalls(targetCanvas, 'fillRect')

		expect(targetCanvas.getContext('2d')?.fillStyle).toBe('#ff0000')
		expect(fillRectCalls).toHaveLength(1)
		expect(fillRectCalls[0]).toEqual(
			expect.objectContaining({ props: { width: 1, height: 1, x: 1, y: 0 } }),
		)
	})

	it('Should not draw if no active cells', () => {
		const targetCanvas = document.createElement('canvas')
		const render = createRenderer([targetCanvas], {
			width: 1,
			height: 1,
			cellDim: 1,
		})

		render([[0, 0]])
		render([[]])
		render([])

		expect(getDrawCalls(targetCanvas, 'fillRect')).toHaveLength(0)
	})

	it('Should only draw rows to one canvas and share the result', () => {
		const sourceCanvas = document.createElement('canvas')
		const secondaryCanvas = document.createElement('canvas')
		const render = createRenderer([sourceCanvas, secondaryCanvas], {
			width: 2,
			height: 1,
			cellDim: 1,
		})

		render([[1, 0]])

		const sourceFillRectCalls = getDrawCalls(sourceCanvas, 'fillRect')
		const secondaryFillRectCalls = getDrawCalls(secondaryCanvas, 'fillRect')
		const secondaryDrawImageCalls = getDrawCalls(secondaryCanvas, 'drawImage')

		expect(sourceFillRectCalls).toHaveLength(1)
		expect(secondaryFillRectCalls).toHaveLength(0)
		expect(secondaryDrawImageCalls).toHaveLength(1)
		expect(secondaryDrawImageCalls[0]).toEqual(
			expect.objectContaining({
				props: expect.objectContaining({ img: sourceCanvas }),
			}),
		)
	})
})

type MockCanvasContext2d = CanvasRenderingContext2D & {
	__getDrawCalls: () => { type: string }[]
}
