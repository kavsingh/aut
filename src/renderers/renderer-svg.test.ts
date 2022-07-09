import { describe, it, expect } from 'vitest'

import { createRenderer } from './renderer-svg'

describe('Renderer Svg', () => {
	it('Should place rects in svg', () => {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		const render = createRenderer([svg], {
			width: 10,
			height: 10,
			cellDim: 1,
		})

		render([
			[1, 0],
			[0, 1],
		])

		const rects = Array.from(svg.querySelectorAll('rect'))

		expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg')
		expect(svg.getAttribute('viewBox')).toBe('0 0 10 10')
		expect(rects).toHaveLength(2)
		expect(rects[0]?.getAttributeNS(null, 'x')).toBe('0')
		expect(rects[0]?.getAttributeNS(null, 'y')).toBe('8')
		expect(rects[0]?.getAttributeNS(null, 'width')).toBe('1')
		expect(rects[0]?.getAttributeNS(null, 'height')).toBe('1')
	})

	it('Should respect draw options', () => {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		const render = createRenderer([svg], {
			width: 2,
			height: 1,
			cellDim: 1,
			fillColor: '#f00',
			fillMode: 'inactive',
		})

		render([[1, 0]])

		expect(svg.querySelector('rect')?.getAttributeNS(null, 'fill')).toEqual(
			'#f00',
		)
	})

	it('Should not draw if no active cells', () => {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		const render = createRenderer([svg], {
			width: 1,
			height: 1,
			cellDim: 1,
		})

		render([[0, 0]])
		render([[]])
		render([])

		expect(svg.querySelector('rect')).toBeNull()
	})
})
