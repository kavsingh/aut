import { For, createSignal, onCleanup, onMount } from "solid-js"

import Audio from "#audio"
import Button from "#components/button"
import { SpeakerIcon } from "#components/icons"
import { StateEmitter } from "#lib/state-emitter"
import { defaultTo, range, sample, valueEq } from "#lib/util"
import { generateInitialWorld, seedRandom } from "#lib/world"
import { createRenderer } from "#renderers/renderer-canvas2d"

import { ALL_EVOLVERS, EVOLVER_NAMES } from "./lib"
import RuleSlider from "./rule-slider"

import type { WorldState } from "#lib/types"

const size = 440
const cellDim = 1
const genSize = size / cellDim

export default function Construct() {
	const audio = new Audio()
	const generateWorldState = worldStateGenerator()
	const state = new StateEmitter(getInitialState(4))
	const [evolverList, setEvolverList] = createSignal(
		toEvolverList(state.get()),
		{ equals: valueEq },
	)

	let worldState: ReturnType<typeof generateWorldState> | undefined = undefined
	let worldCanvasEl: HTMLCanvasElement | null = null
	let render: ReturnType<typeof createRenderer> | undefined = undefined

	function renderWorld() {
		if (worldState && render) render(worldState)
	}

	const unlistenState = state.listen((current) => {
		setEvolverList(toEvolverList(current))

		whenIdle(() => {
			worldState = generateWorldState(current)
			audio.update(worldState)
			requestAnimationFrame(renderWorld)
		})
	})

	onMount(() => {
		if (!worldCanvasEl) return

		render = createRenderer([worldCanvasEl], {
			cellDim,
			width: size,
			height: size,
		})

		worldState = generateWorldState(state.get())
		renderWorld()
	})

	onCleanup(async () => {
		unlistenState()
		await audio.dispose()
	})

	return (
		<>
			<div class="flex size-full items-center justify-center">
				<div data-el="world-container" class="relative size-[440px]">
					<div class="absolute inset-0 z-10">
						<For each={evolverList()}>
							{([id, evolverName]) => (
								<RuleSlider
									evolverName={evolverName}
									initialPosition={(state.get()[id]?.position ?? 0) * size}
									maxPosition={size}
									movable={!!state.get()[id]?.movable}
									onPositionChange={(pos) => {
										state.updateMut((current) => {
											const currentItem = current[id]

											if (currentItem) currentItem.position = pos / size
										})
									}}
									onEvolverSelect={(name) => {
										state.updateMut((current) => {
											const currentItem = current[id]

											if (currentItem) currentItem.evolverName = name
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

function toEvolverList(state: State) {
	return Object.entries(state).map(
		([id, { evolverName }]): [id: string, evolverName: string] => {
			return [id, evolverName]
		},
	)
}

function getInitialState(count: number) {
	const state: Record<string, EvolverItem> = {}

	for (const i of range(count)) {
		state[`evolver-${i}`] = {
			evolverName: defaultTo("rule3", sample(EVOLVER_NAMES)),
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
