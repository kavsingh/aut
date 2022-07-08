import * as rules from './rules'
import { saveSvgSnapshot } from './snapshot-to-svg'
import { addRuleThumbnails } from './thumbnails'
import { seedSingle } from './util'
import { createWorldsForType, startWorldAnimations } from './worlds'

import type { State } from './types'

const main: BootFn = ({
	worldCount,
	worldsContainer,
	thumbnailsContainer,
	snapshotButton,
}) => {
	const cellDim = 2
	const worldDim = Math.min(Math.floor(window.innerWidth / worldCount), 300)
	const state: State = {
		cellDim,
		worldDim,
		rules: Object.values(rules),
		evolver: undefined,
		world: [seedSingle(worldDim / cellDim)],
	}

	const thumbnails = addRuleThumbnails(state.rules, thumbnailsContainer)
	const { render: renderWorld } = createWorldsForType(
		'canvas2d',
		worldsContainer,
		{
			count: worldCount,
			rendererOptions: { cellDim, width: worldDim, height: worldDim },
		},
	)

	thumbnails.forEach(({ element, evolver }) => {
		element.addEventListener('click', () => void (state.evolver = evolver))
	})

	worldsContainer.addEventListener(
		'click',
		() => void (state.evolver = undefined),
	)

	snapshotButton.addEventListener(
		'click',
		() => void saveSvgSnapshot('snapshot.svg', state),
	)

	startWorldAnimations(state, { worldCount, renderWorld })
}

if (typeof window !== 'undefined') window.bootApp = main

export default main
