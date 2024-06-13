import { For, onCleanup, onMount } from "solid-js"

import Audio from "#audio"
import Button from "#components/button"
import { SpeakerIcon } from "#components/icons"
import { createEvolver } from "#lib/evolver"
import * as rules from "#lib/rules"
import { StateEmitter } from "#lib/state-emitter"
import { findLast, range, sample } from "#lib/util"
import { generateInitialWorld, seedRandom } from "#lib/world"
import { createRenderer } from "#renderers/renderer-canvas2d"

import RuleSlider from "./rule-slider"

import type { WorldState, WorldStateEvolver } from "#lib/types"

export default function Construct() {
	const size = 440
	const cellDim = 2
	const genSize = size / cellDim
	const audio = new Audio()
	const firstGen = generateInitialWorld(genSize, genSize, seedRandom)
	const evolverState = new StateEmitter({ evolvers: sampleEvolvers(3) })
	let worldState = range(genSize).reduce<WorldState>(
		evolveReducer(evolverState.get().evolvers),
		firstGen,
	)
	let worldCanvasEl: HTMLCanvasElement | null = null
	let unlistenState: (() => void) | undefined = undefined

	onMount(() => {
		if (!worldCanvasEl) return

		const render = createRenderer([worldCanvasEl], {
			cellDim,
			width: size,
			height: size,
		})

		function renderWorld() {
			render(worldState)
		}

		unlistenState = evolverState.listen(({ evolvers }) => {
			worldState = range(genSize).reduce<WorldState>(
				evolveReducer(evolvers),
				firstGen,
			)

			audio.update(worldState)
			requestAnimationFrame(renderWorld)
		})

		renderWorld()
	})

	onCleanup(async () => {
		unlistenState?.()
		await audio.dispose()
	})

	return (
		<>
			<div class="flex size-full items-center justify-center">
				<div data-el="world-container" class="relative size-[440px]">
					<div class="absolute inset-0 z-10">
						<For each={evolverState.get().evolvers}>
							{(item, idx) => (
								<RuleSlider
									evolver={item.evolver}
									initialPosition={item.position * size}
									maxPosition={size}
									allowMove={idx() !== 0}
									onPositionChange={(pos) => {
										whenIdle(() => {
											item.position = pos / size
											evolverState.update((current) => ({
												evolvers: [...current.evolvers].sort(
													(a, b) => a.position - b.position,
												),
											}))
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

const whenIdle =
	typeof window.requestIdleCallback === "function"
		? window.requestIdleCallback
		: (fn: () => void) => setTimeout(fn, 0)

type EvolverItem = { evolver: WorldStateEvolver; position: number }
