import { getThemeValue } from '~/lib/css'
import { range } from '~/lib/util'
import { generateInitialWorld, seedRandom } from '~/lib/world'
import { createRenderer } from '~/renderers/renderer-canvas2d'

import type { Component, WorldStateEvolver } from '~/lib/types'

const RuleThumbnail: Component<{
	evolver: WorldStateEvolver
	fillColor?: string
	size?: number
}> = ({ evolver, fillColor, size = 40 }) => {
	const el = document.createElement('canvas')
	const ruleRenderer = createRenderer([el], {
		cellDim: 1,
		width: size,
		height: size,
		fillColor: fillColor ?? getThemeValue('--color-line-600'),
	})
	const state = range(size).reduce(
		(acc) => evolver(acc),
		generateInitialWorld(size, size, seedRandom),
	)

	ruleRenderer(state)

	return { el }
}

export default RuleThumbnail
