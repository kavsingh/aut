import Audio from "~/audio"
import Button from "~/components/button"
import { speaker } from "~/components/icons"
import { htmlToFragment } from "~/lib/dom"
import { createEvolver } from "~/lib/evolver"
import * as rules from "~/lib/rules"
import { createStateEmitter } from "~/lib/state-emitter"
import { findLast, range, sample } from "~/lib/util"
import { generateInitialWorld, seedRandom } from "~/lib/world"
import { createRenderer } from "~/renderers/renderer-canvas2d"

import RuleSlider from "./rule-slider"

import type { Component, WorldState, WorldStateEvolver } from "~/lib/types"

const screenHtml = /*html*/ `
<div class="flex items-center justify-center w-full h-full">
	<div data-el="world-container" class="relative w-[440px] h-[440px]">
		<div 
			data-el="sliders-container"
			class="absolute inset-0 z-10"
		></div>
		<canvas
			data-el="world-canvas"
			class="absolute inset-0 z-0 bg-white dark:bg-neutral-900"
		></canvas>
	</div>
</div>
<div
	data-el="buttons-container"
	class="absolute flex gap-4 -translate-x-1/2 bottom-[2em] start-1/2"
></div>
`

const Construct: Component = () => {
	const el = htmlToFragment(screenHtml)
	const worldCanvasEl = el.querySelector<HTMLCanvasElement>(
		"[data-el='world-canvas']",
	)
	const worldContainerEl = el.querySelector<HTMLDivElement>(
		"[data-el='world-container']",
	)
	const slidersContainerEl = el.querySelector<HTMLDivElement>(
		"[data-el='sliders-container']",
	)
	const buttonsContainerEl = el.querySelector<HTMLDivElement>(
		"[data-el='buttons-container']",
	)

	if (
		!(
			worldCanvasEl &&
			worldContainerEl &&
			slidersContainerEl &&
			buttonsContainerEl
		)
	) {
		throw new Error("bad dom")
	}

	const size = 440
	const cellDim = 2
	const genSize = size / cellDim
	const audio = new Audio()
	const firstGen = generateInitialWorld(genSize, genSize, seedRandom)
	const evolverState = createStateEmitter({ evolvers: sampleEvolvers(3) })
	let worldState = range(genSize).reduce<WorldState>(
		evolveReducer(evolverState.get().evolvers),
		firstGen,
	)

	const render = createRenderer([worldCanvasEl], {
		cellDim,
		width: size,
		height: size,
	})

	function constructRuleSliders(evolvers: EvolverItem[]) {
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

		for (const slider of sliders) {
			slidersContainerEl?.appendChild(slider.el)
		}
	}

	function renderWorld() {
		render(worldState)
	}

	function dispose() {
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
		as: "button",
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
	typeof window.requestIdleCallback === "function"
		? window.requestIdleCallback
		: (fn: () => void) => setTimeout(fn, 0)

const allEvolvers = Object.values(rules).map((rule) =>
	createEvolver(rule, true),
)

function sampleEvolvers(count: number) {
	return range(count).map<EvolverItem>((_, i, it) => ({
		evolver: sample(allEvolvers),
		position: i / it.length,
	}))
}

function evolveReducer(evolvers: EvolverItem[]) {
	return function reducer(acc: WorldState, index: number): WorldState {
		const evolver = findLast(
			({ position }) => position <= index / acc.length,
			evolvers,
		)?.evolver

		return evolver?.(acc) ?? acc
	}
}

type EvolverItem = { evolver: WorldStateEvolver; position: number }
