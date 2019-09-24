import { sample, pipe, constant } from './util.js'
import { createEvolver } from './evolver.js'
import { createCanvasRenderer } from './renderer'

export const startAnimations = (state, canvases) => {
	const selectRandomEvolver = pipe(
		constant(state.rules),
		sample,
		createEvolver,
	)

	const render = createCanvasRenderer(canvases, {
		cellDim: state.cellDim,
		width: state.worldDim,
		height: state.worldDim,
	})

	const switchThreshold = Math.floor(state.worldDim / (canvases.length * 2))

	let switchAccum = 0
	let evolver = state.evolver || selectRandomEvolver()

	const update = () => {
		switchAccum = switchAccum >= switchThreshold ? 0 : switchAccum + 1
		evolver =
			switchAccum === 0 ? state.evolver || selectRandomEvolver() : evolver
		state.world = evolver(state.world)
	}

	const onFrame = () => {
		render(state.world)
		window.requestAnimationFrame(onFrame)
	}

	setInterval(update, 14)
	window.requestAnimationFrame(onFrame)
}
