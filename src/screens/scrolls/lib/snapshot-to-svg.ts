import { svgNs, createRenderer } from '~/renderers/renderer-svg'

import type { State } from './types'

// ganked from https://stackoverflow.com/a/38019175

export const saveSvgSnapshot = (name: string, state: State) => {
	const svg = document.createElementNS(svgNs, 'svg')
	const downloadTrigger = document.createElement('a')

	createRenderer([svg], {
		width: state.worldDim,
		height: state.worldDim,
		cellDim: state.cellDim,
	})(state.world)

	const svgUrl = URL.createObjectURL(
		new Blob([svg.outerHTML], { type: 'image/svg+xml;charset=utf-8' }),
	)

	downloadTrigger.href = svgUrl
	downloadTrigger.download = name

	document.body.appendChild(downloadTrigger)

	downloadTrigger.click()

	document.body.removeChild(downloadTrigger)
}
