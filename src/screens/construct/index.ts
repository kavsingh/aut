import { createAudio } from '~/audio'
import Button from '~/components/button'
import { getThemeValue } from '~/lib/css'
import { htmlToFragment } from '~/lib/dom'
import { createEvolver } from '~/lib/evolver'
import * as rules from '~/lib/rules'
import { createStateEmitter } from '~/lib/state-emitter'
import { findLast, range, sample } from '~/lib/util'
import { generateInitialWorld, seedRandom } from '~/lib/world'
import { createRenderer } from '~/renderers/renderer-canvas2d'
import { speaker } from '~/style/icons'

import { screen } from './construct.html'
import {
	worldCanvas,
	worldContainer,
	slidersContainer,
	buttons,
} from './construct.module.css'
import RuleSlider from './rule-slider'

import type { Component, WorldState, WorldStateEvolver } from '~/lib/types'

const Construct: Component = () => {
	const el = htmlToFragment(screen)
	const worldCanvasEl = el.querySelector<HTMLCanvasElement>(`.${worldCanvas}`)
	const worldContainerEl = el.querySelector<HTMLDivElement>(
		`.${worldContainer}`,
	)
	const slidersContainerEl = el.querySelector<HTMLDivElement>(
		`.${slidersContainer}`,
	)
	const buttonsContainerEl = el.querySelector<HTMLDivElement>(`.${buttons}`)

	if (
		!(
			worldCanvasEl &&
			worldContainerEl &&
			slidersContainerEl &&
			buttonsContainerEl
		)
	) {
		throw new Error('bad dom')
	}

	const size = 440
	const cellDim = 2
	const genSize = size / cellDim
	const audio = createAudio()
	const firstGen = generateInitialWorld(genSize, genSize, seedRandom)
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
					whenIdle(() => {
						item.position = pos / size
						evolverState.update(() => ({
							evolvers: [...evolvers].sort((a, b) => a.position - b.position),
						}))
					})
				},
			}),
		)

		sliders.forEach((slider) => slidersContainerEl.appendChild(slider.el))
	}

	const renderWorld = () => {
		render(worldState)
	}

	const dispose = () => {
		evolverState.clear()
		return audio.dispose()
	}

	evolverState.listen(({ evolvers }) => {
		worldState = range(genSize).reduce<WorldState>(
			evolveReducer(evolvers),
			firstGen,
		)

		audio.update(worldState)
		requestAnimationFrame(renderWorld)
	})

	const audioButton = Button({
		as: 'button',
		content: speaker,
		onClick: () => {
			audio.update(worldState)
			audio.toggle()
		},
	})

	buttonsContainerEl.appendChild(audioButton.el)
	constructRuleSliders(evolverState.get().evolvers)
	renderWorld()

	return { el, dispose }
}

export default Construct

const whenIdle =
	typeof window.requestIdleCallback === 'function'
		? window.requestIdleCallback
		: (fn: () => void) => setTimeout(fn, 0)

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
