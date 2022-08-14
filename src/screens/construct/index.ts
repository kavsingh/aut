import { createAudio } from '~/audio'
import { getThemeValue } from '~/lib/css'
import { htmlToFragment } from '~/lib/dom'
import { createEvolver } from '~/lib/evolver'
import * as rules from '~/lib/rules'
import { createStateEmitter } from '~/lib/state-emitter'
import { findLast, range, sample } from '~/lib/util'
import { generateInitialWorld, seedRandom } from '~/lib/world'
import { createRenderer } from '~/renderers/renderer-canvas2d'

import { screen } from './construct.html'
import {
	audioButton,
	thumbnailsContainer,
	worldCanvas,
	worldContainer,
} from './construct.module.css'
import RuleSlider from './rule-slider'

import type { Component, WorldState, WorldStateEvolver } from '~/lib/types'

const Construct: Component = () => {
	const size = 600
	const cellDim = 2
	const genSize = size / cellDim
	const el = htmlToFragment(screen)
	const worldCanvasEl = el.querySelector<HTMLCanvasElement>(`.${worldCanvas}`)
	const worldContainerEl = el.querySelector<HTMLDivElement>(
		`.${worldContainer}`,
	)
	const thumbnailsContainerEl = el.querySelector<HTMLDivElement>(
		`.${thumbnailsContainer}`,
	)
	const audioButtonEl = el.querySelector<HTMLDivElement>(`.${audioButton}`)

	if (
		!(
			worldContainerEl &&
			worldCanvasEl &&
			thumbnailsContainerEl &&
			audioButtonEl
		)
	) {
		throw new Error('bad dom')
	}

	const firstGen = generateInitialWorld(genSize, genSize, seedRandom)
	const audio = createAudio()

	const evolverState = createStateEmitter({ evolvers: sampleEvolvers(4) })
	let worldState = range(genSize).reduce<WorldState>(
		evolveReducer(evolverState.get().evolvers),
		firstGen,
	)

	const render = createRenderer([worldCanvasEl], {
		cellDim,
		width: size,
		height: size,
		fillColor: getThemeValue('--color-line-600'),
	})

	const constructRuleSliders = (evolvers: EvolverItem[]) => {
		const sliders = evolvers.map((item, idx) =>
			RuleSlider({
				evolver: item.evolver,
				initialPosition: item.position * size,
				maxPosition: size,
				allowMove: idx !== 0,
				onPositionChange: (pos) => {
					item.position = pos / size
					evolverState.update(() => ({
						evolvers: [...evolvers].sort((a, b) => a.position - b.position),
					}))
				},
			}),
		)

		sliders.forEach((slider) => thumbnailsContainerEl.appendChild(slider.el))
	}

	const onAnimFrame = () => {
		render(worldState)

		requestAnimationFrame(onAnimFrame)
	}

	audioButtonEl.addEventListener('click', () => {
		audio.update(worldState)
		audio.toggle()
	})

	evolverState.listen(({ evolvers }) => {
		worldState = range(genSize).reduce<WorldState>(
			evolveReducer(evolvers),
			firstGen,
		)

		audio.update(worldState)
	})

	constructRuleSliders(evolverState.get().evolvers)
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
