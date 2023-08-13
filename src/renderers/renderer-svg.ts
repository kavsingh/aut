import { last, head, groupIndecesBy, eq } from "../lib/util"

import type { RendererFactory } from "./types"

export const svgNs = "http://www.w3.org/2000/svg"

export const createRenderer: SvgRendererFactory = (
	svgElements,
	{
		width = 200,
		height = 200,
		cellDim = 2,
		fillColor = "#000000",
		fillMode = "active",
	},
) => {
	const groupFillRanges = groupIndecesBy<number>(
		eq(fillMode === "inactive" ? 0 : 1),
	)

	function clear() {
		svgElements.forEach((element) => void (element.innerHTML = ""))
	}

	const drawRow = (row: number[], yOffset: number) => {
		const rowFragment = document.createDocumentFragment()

		for (const current of groupFillRanges(row)) {
			const start = head(current)
			const end = last(current)

			if (start !== undefined && end !== undefined) {
				const fillRect = document.createElementNS(svgNs, "rect")

				fillRect.setAttributeNS(null, "x", `${start * cellDim}`)
				fillRect.setAttributeNS(null, "y", `${yOffset}`)
				fillRect.setAttributeNS(null, "width", `${current.length * cellDim}`)
				fillRect.setAttributeNS(null, "height", `${cellDim}`)
				fillRect.setAttributeNS(null, "fill", fillColor)

				rowFragment.appendChild(fillRect)
			}
		}

		for (const element of svgElements) {
			element.appendChild(rowFragment.cloneNode(true))
		}
	}

	for (const element of svgElements) {
		element.setAttribute("xmlns", svgNs)
		element.setAttribute("viewBox", `0 0 ${width} ${height}`)
	}

	return function render(state) {
		clear()

		for (let i = 0; i < state.length; i++) {
			const row = state[i]

			if (row) drawRow(row, height - (state.length - i) * cellDim)
		}
	}
}

export type SvgRendererFactory = RendererFactory<SVGElement>
