import { create2dRenderer } from './renderers/renderer-2d'
import { sample, pipe, constant, defaultTo } from './util'
import { createEvolver } from './evolver'
import { State } from './types'
import { rule3 } from './rules'

export const startAnimations = (
	state: State,
	canvases: HTMLCanvasElement[],
) => {
	const selectRandomEvolver = pipe(
		constant(state.rules),
		sample,
		defaultTo(rule3),
		createEvolver,
	)
	const nextEvolver = () => state.evolver || selectRandomEvolver()

	const render = create2dRenderer(canvases, {
		cellDim: state.cellDim,
		width: state.worldDim,
		height: state.worldDim,
	})

	const switchThreshold = Math.floor(state.worldDim / (canvases.length * 2))

	let switchAccum = 0
	let evolver = nextEvolver()

	const update = () => {
		switchAccum = switchAccum >= switchThreshold ? 0 : switchAccum + 1
		evolver = switchAccum === 0 ? nextEvolver() : evolver
		state.world = evolver(state.world)
	}

	const onFrame = () => {
		render(state.world)
		window.requestAnimationFrame(onFrame)
	}

	setInterval(update, 14)
	window.requestAnimationFrame(onFrame)
}
