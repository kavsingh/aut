import { getComputedFillColor } from "#lib/color"
import { range } from "#lib/util"
import { generateInitialWorld, seedRandom } from "#lib/world"
import { createRenderer } from "#renderers/renderer-canvas2d"

import type { Component, WorldStateEvolver } from "#lib/types"

const RuleThumbnail: Component<{
	evolver: WorldStateEvolver
	fillColor?: string
	size?: number
	class?: string
}> = ({ evolver, class: className, fillColor, size = 40 }) => {
	const state = range(size).reduce(
		(acc) => evolver(acc),
		generateInitialWorld(size, size, seedRandom),
	)

	const el = document.createElement("canvas")

	const ruleRenderer = createRenderer([el], {
		cellDim: 1,
		width: size,
		height: size,
		fillColor: fillColor ?? getComputedFillColor(),
	})

	if (className) el.classList.add(...className.split(" "))
	ruleRenderer(state)

	return { el }
}

export default RuleThumbnail
