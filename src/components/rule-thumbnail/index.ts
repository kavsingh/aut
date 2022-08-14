import { range } from '~/lib/util'
import { generateInitialWorld, seedRandom } from '~/lib/world'
import { createRenderer } from '~/renderers/renderer-canvas2d'

import type { Component, WorldStateEvolver } from '~/lib/types'

const RuleThumbnail: Component<{
	fillColor: string
	evolver: WorldStateEvolver
	size?: number
}> = ({ evolver, fillColor, size = 40 }) => {
	const el = document.createElement('canvas')
	const ruleRenderer = createRenderer([el], {
		fillColor,
		cellDim: 1,
		width: size,
		height: size,
	})
	const state = range(size).reduce(
		(acc) => evolver(acc),
		generateInitialWorld(size, size, seedRandom),
	)

	ruleRenderer(state)

	return { el }
}

export default RuleThumbnail
