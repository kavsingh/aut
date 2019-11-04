import { State } from './types'
import { seedSingle } from './util'
import { addRuleThumbnails } from './thumbnails'
import { startAnimations } from './animations'
import * as rules from './rules'

const main = (
	canvases: HTMLCanvasElement[],
	thumbnailsContainer: HTMLElement,
) => {
	const cellDim = 2
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

	const thumbnails = addRuleThumbnails(state.rules, thumbnailsContainer)

	thumbnails.forEach(({ element, evolver }) => {
		element.addEventListener('click', () => (state.evolver = evolver))
	})

	canvases.forEach(canvas =>
		canvas.addEventListener('click', () => (state.evolver = undefined)),
	)

	startAnimations(state, canvases)
}

if (typeof window !== 'undefined') window.bootApp = main

export default main
