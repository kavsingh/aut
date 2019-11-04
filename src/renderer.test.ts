import { createCanvasRenderer } from './renderer'

const mockCanvas = (): any => {
	const fillRect = jest.fn()
	const clearRect = jest.fn()

	return {
		getContext: () => ({ fillRect, clearRect }),
	}
}

describe('Renderer', () => {
	it('Should draw state to canvas context', () => {
		const canvas = mockCanvas()
		const { clearRect, fillRect } = canvas.getContext()
		const render = createCanvasRenderer([canvas], {
			width: 10,
			height: 10,
			cellDim: 1,
		})

		render([[1, 0], [0, 1]])

		expect(clearRect).toHaveBeenCalledTimes(1)

		const fillCalls = fillRect.mock.calls

		expect(fillCalls).toHaveLength(2)
		// First active, second row from bottom (state is 2 rows)
		expect(fillCalls[0]).toEqual([0, 8, 1, 1])
		// Second active, first row from bottom, second column
		// (last row drawn at bottom of height)
		expect(fillCalls[1]).toEqual([1, 9, 1, 1])
	})

	it('Should draw only visible rows from state', () => {
		const canvas = mockCanvas()
		const { clearRect, fillRect } = canvas.getContext()
		const render = createCanvasRenderer([canvas], {
			width: 10,
			height: 4,
			cellDim: 2,
		})

		render([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 0, 0], [0, 1, 1]])

		expect(clearRect).toHaveBeenCalledTimes(1)

		const fillCalls = fillRect.mock.calls

		// Draw only visible state
		// height 4, cell height 2 => 2 rows visible
		// last visible row has 2 adjacent active slots, so draw once
		expect(fillCalls).toHaveLength(2)
		expect(fillCalls[0]).toEqual([0, 0, 2, 2])
		expect(fillCalls[1]).toEqual([2, 2, 4, 2])
	})
})
