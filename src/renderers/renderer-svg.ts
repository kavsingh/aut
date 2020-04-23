import { last, head, groupIndecesBy, eq } from '../util'
import { SvgRendererFactory } from './types'

export const svgNs = 'http://www.w3.org/2000/svg'

export const createRenderer: SvgRendererFactory = (
	svgElements,
	{
		width = 200,
		height = 200,
		cellDim = 2,
		fillColor = '#000000',
		fillMode = 'active',
	},
) => {
	const maxRows = Math.floor(height / cellDim)
	const groupFillRanges = groupIndecesBy<number>(
		eq(fillMode === 'inactive' ? 0 : 1),
	)

	const clear = () =>
		svgElements.forEach((element) => void (element.innerHTML = ''))

	const drawRow = (row: number[], yOffset: number) => {
		const fillRanges = groupFillRanges(row)
		const rowFragment = document.createDocumentFragment()

		for (let i = 0; i < fillRanges.length; i++) {
			const current = fillRanges[i]
			const start = head(current)
			const end = last(current)

			if (start !== undefined && end !== undefined) {
				const fillRect = document.createElementNS(svgNs, 'rect')

				fillRect.setAttributeNS(null, 'x', `${start * cellDim}`)
				fillRect.setAttributeNS(null, 'y', `${yOffset}`)
				fillRect.setAttributeNS(null, 'width', `${current.length * cellDim}`)
				fillRect.setAttributeNS(null, 'height', `${cellDim}`)
				fillRect.setAttributeNS(null, 'fill', fillColor)

				rowFragment.appendChild(fillRect)
			}
		}

		svgElements.forEach((element) => {
			element.appendChild(rowFragment.cloneNode(true))
		})
	}

	svgElements.forEach((element) => {
		element.setAttribute('xmlns', svgNs)
		element.setAttribute('viewBox', `0 0 ${width} ${height}`)
	})

	return (state) => {
		clear()

		const startIdx = Math.max(0, state.length - maxRows)

		for (let i = startIdx; i < state.length; i++) {
			drawRow(state[i], height - (state.length - i) * cellDim)
		}
	}
}
