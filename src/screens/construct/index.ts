import { createEvolver } from '~/lib/evolver'
import * as rules from '~/lib/rules'
import { createStateEmitter } from '~/lib/state-emitter'
import { createRenderer } from '~/renderers/renderer-canvas2d'
import {
	findLast,
	generateInitialWorld,
	getCssValue,
	range,
	sample,
	seedRandom,
} from '~/util'
import { htmlToFragment } from '~/util/dom'

import { screen } from './construct.html'
import { worldCanvas, worldContainer } from './construct.module.css'

import type { Component, WorldState, WorldStateEvolver } from '~/lib/types'

const Construct: Component = () => {
	const size = 600
	const el = htmlToFragment(screen)
	const worldCanvasEl = el.querySelector<HTMLCanvasElement>(`.${worldCanvas}`)
	const worldContainerEl = el.querySelector<HTMLDivElement>(
		`.${worldContainer}`,
	)

	if (!(worldContainerEl && worldCanvasEl)) {
		throw new Error('bad dom')
	}

	const evolverState = createStateEmitter({ evolvers: sampleEvolvers(4) })
	let worldState = range(size).reduce<WorldState>(
		evolveReducer(evolverState.get().evolvers),
		generateInitialWorld(size, size, seedRandom),
	)

	const render = createRenderer([worldCanvasEl], {
		cellDim: 1,
		width: size,
		height: size,
		fillColor: getCssValue('--color-line-600'),
	})

	evolverState.listen(({ evolvers }) => {
		worldState = range(size).reduce<WorldState>(
			evolveReducer(evolvers),
			worldState,
		)
	})

	// setInterval(
	// 	() =>
	// 		evolverState.update((current) => ({
	// 			evolvers: current.evolvers.map((item, index) => ({
	// 				...item,
	// 				position: item.position + (index === 0 ? 0 : 0.01),
	// 			})),
	// 		})),
	// 	16,
	// )

	const onAnimFrame = () => {
		render(worldState)

		// requestAnimationFrame(onAnimFrame)
	}

	onAnimFrame()

	return { el }
}

export default Construct

const allEvolvers = Object.values(rules).map(createEvolver)

const sampleEvolvers = (count: number) =>
	range(count).map<EvolverItem>((_, i, it) => ({
		evolver: sample(allEvolvers),
		position: i / it.length,
	}))

const evolveReducer =
	(evolvers: EvolverItem[]) =>
	(acc: WorldState, index: number): WorldState => {
		const evolver = findLast(
			({ position }) => position <= index / acc.length,
			evolvers,
		)?.evolver

		return evolver?.(acc) ?? acc
	}
type EvolverItem = { evolver: WorldStateEvolver; position: number }
