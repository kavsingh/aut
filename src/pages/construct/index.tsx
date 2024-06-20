import { For, createEffect, onCleanup, onMount } from "solid-js"
import { createStore } from "solid-js/store"

import Audio from "#audio"
import Button from "#components/button"
import { SpeakerIcon } from "#components/icons"
import { defaultTo, range, sample } from "#lib/util"
import { generateInitialWorld, seedRandom } from "#lib/world"
import { createRenderer } from "#renderers/renderer-canvas2d"

import { ALL_EVOLVERS } from "./lib"
import RuleSlider from "./rule-slider"

import type { WorldState } from "#lib/types"

const size = 440
const cellDim = 2
const genSize = size / cellDim

export default function Construct() {
	const audio = new Audio()
	const generateWorldState = worldStateGenerator()
	const [store, updateStore] = createStore(getInitialState(3))

	let worldState: ReturnType<typeof generateWorldState> | undefined = undefined
	let worldCanvasEl: HTMLCanvasElement | null = null
	let render: ReturnType<typeof createRenderer> | undefined = undefined

	function renderWorld() {
		if (worldState && render) render(worldState)
	}

	onMount(() => {
		if (!worldCanvasEl) return

		render = createRenderer([worldCanvasEl], {
			cellDim,
			width: size,
			height: size,
		})

		renderWorld()
	})

	createEffect(() => {
		worldState = generateWorldState(store)

		whenIdle(() => {
			if (!worldState) return

			audio.update(worldState)
			requestAnimationFrame(renderWorld)
		})
	})

	onCleanup(async () => {
		await audio.dispose()
	})

	return (
		<>
			<div class="flex size-full items-center justify-center">
				<div data-el="world-container" class="relative size-[440px]">
					<div class="absolute inset-0 z-10">
						<For each={Object.entries(store)}>
							{([id, item]) => (
								<RuleSlider
									evolverName={item.evolverName}
									initialPosition={item.position * size}
									maxPosition={size}
									movable={item.movable}
									onPositionChange={(pos) => {
										updateStore(id, (current) => {
											return { ...current, position: pos / size }
										})
									}}
									onEvolverSelect={(evolverName) => {
										updateStore(id, (current) => {
											return { ...current, evolverName }
										})
									}}
								/>
							)}
						</For>
					</div>
					<canvas
						class="absolute inset-0 z-0 bg-white dark:bg-neutral-900"
						ref={(el) => (worldCanvasEl = el)}
					/>
				</div>
			</div>
			<div class="absolute bottom-[2em] start-1/2 flex -translate-x-1/2 gap-4">
				<Button
					onClick={() => {
						audio.toggle()
					}}
				>
					<SpeakerIcon />
				</Button>
			</div>
		</>
	)
}

const evolverNames = Object.keys(ALL_EVOLVERS)

function getInitialState(count: number) {
	const state: Record<string, EvolverItem> = {}

	for (const i of range(count)) {
		state[`evolver-${i}`] = {
			evolverName: defaultTo("rule3", sample(evolverNames)),
			position: i / count,
			movable: i !== 0,
		}
	}

	return state
}

function worldStateGenerator() {
	const firstGen = generateInitialWorld(genSize, genSize, seedRandom)

	return function generateWorldState(state: State) {
		const sorted = Object.values(state).sort((a, b) => b.position - a.position)

		return range(genSize).reduce<WorldState>((acc, idx) => {
			const evolverName = sorted.find(({ position }) => {
				return position <= idx / acc.length
			})?.evolverName

			const evolver = evolverName ? ALL_EVOLVERS[evolverName] : undefined

			return evolver?.(acc) ?? acc
		}, firstGen)
	}
}

const whenIdle =
	typeof window.requestIdleCallback === "function"
		? window.requestIdleCallback
		: (fn: () => void) => setTimeout(fn, 0)

type EvolverItem = {
	evolverName: keyof typeof ALL_EVOLVERS
	position: number
	movable: boolean
}

type State = ReturnType<typeof getInitialState>
