import { For, onCleanup, onMount } from "solid-js"

import Audio from "#audio"
import Button from "#components/button"
import { SpeakerIcon } from "#components/icons"
import { StateEmitter } from "#lib/state-emitter"
import { defaultTo, range, sample } from "#lib/util"
import { generateInitialWorld, seedRandom } from "#lib/world"
import { createRenderer } from "#renderers/renderer-canvas2d"

import { ALL_EVOLVERS } from "./lib"
import RuleSlider from "./rule-slider"

import type { WorldState } from "#lib/types"

export default function Construct() {
	const size = 440
	const cellDim = 2
	const genSize = size / cellDim
	const audio = new Audio()
	const evolverState = new StateEmitter({ evolvers: sampleEvolvers(3) })
	let worldCanvasEl: HTMLCanvasElement | null = null
	let unlistenState: (() => void) | undefined = undefined

	onMount(() => {
		if (!worldCanvasEl) return

		const firstGen = generateInitialWorld(genSize, genSize, seedRandom)
		let worldState = generateWorldState()

		function generateWorldState() {
			return range(genSize).reduce<WorldState>(
				evolveReducer(evolverState.get().evolvers),
				firstGen,
			)
		}

		const render = createRenderer([worldCanvasEl], {
			cellDim,
			width: size,
			height: size,
		})

		function renderWorld() {
			render(worldState)
		}

		unlistenState = evolverState.listen(() => {
			whenIdle(() => {
				worldState = generateWorldState()
				audio.update(worldState)
				requestAnimationFrame(renderWorld)
			})
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
									evolverName={item.evolverName}
									initialPosition={item.position * size}
									maxPosition={size}
									allowMove={idx() !== 0}
									onPositionChange={(pos) => {
										evolverState.updateMut((current) => {
											const target = current.evolvers.find(
												(c) => c.id === item.id,
											)

											if (!target) return

											target.position = pos / size
											current.evolvers.sort((a, b) => a.position - b.position)
										})
									}}
									onEvolverSelect={(evolverName) => {
										evolverState.updateMut((current) => {
											const target = current.evolvers.find(
												(c) => c.id === item.id,
											)

											if (target) target.evolverName = evolverName
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

function sampleEvolvers(count: number) {
	return range(count).map<EvolverItem>((_, i, it) => ({
		id: `evolver-${i}`,
		evolverName: defaultTo("rule3", sample(evolverNames)),
		position: i / it.length,
	}))
}

function evolveReducer(evolverItems: readonly EvolverItem[]) {
	return function reducer(acc: WorldState, index: number): WorldState {
		const evolverName = evolverItems.findLast(({ position }) => {
			return position <= index / acc.length
		})?.evolverName

		const evolver = evolverName ? ALL_EVOLVERS[evolverName] : undefined

		return evolver?.(acc) ?? acc
	}
}

const whenIdle =
	typeof window.requestIdleCallback === "function"
		? window.requestIdleCallback
		: (fn: () => void) => setTimeout(fn, 0)

type EvolverItem = {
	id: string
	evolverName: keyof typeof ALL_EVOLVERS
	position: number
}
