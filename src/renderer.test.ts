import { createCanvasRenderer } from './renderer'

const mockCanvas = () => {
	const context2d = {
		fillRect: jest.fn(),
		clearRect: jest.fn(),
		fillStyle: '',
	}
	const canvas: any = {
		getContext: jest.fn((contextType: string) =>
			contextType === '2d' ? context2d : null,
		),
	}

	return { canvas, context2d }
}

describe('Renderer', () => {
	it('Should draw state to canvas context', () => {
		const { canvas, context2d } = mockCanvas()
		const render = createCanvasRenderer([canvas], {
			width: 10,
			height: 10,
			cellDim: 1,
		})

		render([
			[1, 0],
			[0, 1],
		])

		const { fillStyle, clearRect, fillRect } = context2d
		const fillCalls = fillRect.mock.calls

		expect(canvas).toEqual(expect.objectContaining({ width: 10, height: 10 }))
		expect(fillStyle).toBe('#000000')
		expect(clearRect).toHaveBeenCalledTimes(1)

		expect(fillCalls).toHaveLength(2)
		// First active, second row from bottom (state is 2 rows)
		expect(fillCalls[0]).toEqual([0, 8, 1, 1])
		// Second active, first row from bottom, second column
		// (last row drawn at bottom of height)
		expect(fillCalls[1]).toEqual([1, 9, 1, 1])
	})

	it('Should draw only visible rows from state', () => {
		const { canvas, context2d } = mockCanvas()
		const render = createCanvasRenderer([canvas], {
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

		const { clearRect, fillRect } = context2d
		const fillCalls = fillRect.mock.calls

		expect(clearRect).toHaveBeenCalledTimes(1)

		// Draw only visible state
		// height 4, cell height 2 => 2 rows visible
		// last visible row has 2 adjacent active slots, so draw once
		expect(fillCalls).toHaveLength(2)
		expect(fillCalls[0]).toEqual([0, 0, 2, 2])
		expect(fillCalls[1]).toEqual([2, 2, 4, 2])
	})

	it('Should respect draw options', () => {
		const { canvas, context2d } = mockCanvas()
		const render = createCanvasRenderer([canvas], {
			width: 2,
			height: 1,
			cellDim: 1,
			fillColor: '#f00',
			fillMode: 'inactive',
		})

		render([[1, 0]])

		const { fillStyle, fillRect } = context2d
		const fillCalls = fillRect.mock.calls

		expect(fillStyle).toBe('#f00')
		expect(fillCalls).toHaveLength(1)
		expect(fillCalls[0]).toEqual([1, 0, 1, 1])
	})

	it('Should not draw if no active cells', () => {
		const { canvas, context2d } = mockCanvas()
		const render = createCanvasRenderer([canvas], {
			width: 1,
			height: 1,
			cellDim: 1,
		})

		render([[0, 0]])
		render([[]])
		render([])

		expect(context2d.fillRect).not.toHaveBeenCalled()
	})
})
