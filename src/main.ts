import { State } from './types'
import { seedSingle } from './util'
import { addRuleThumbnails } from './thumbnails'
import { startAnimations } from './animations'
import * as rules from './rules'

const main: BootFn = (canvasElements, thumbnailsContainerElement) => {
	const cellDim = 2
	const canvases = Array.from(canvasElements)
	const worldDim = Math.min(
		Math.floor(window.innerWidth / canvases.length),
		300,
	)

	const state: State = {
		cellDim,
		worldDim,
		rules: Object.values(rules),
		evolver: undefined,
		world: [seedSingle(worldDim / cellDim)],
	}

	const thumbnails = addRuleThumbnails(state.rules, thumbnailsContainerElement)

	thumbnails.forEach(({ element, evolver }) => {
		element.addEventListener('click', () => void (state.evolver = evolver))
	})

	canvases.forEach(canvas =>
		canvas.addEventListener('click', () => void (state.evolver = undefined)),
	)

	startAnimations(state, canvases)
}

if (typeof window !== 'undefined') window.bootApp = main

export default main
