import { For, onCleanup, onMount } from "solid-js"
import { createStore, reconcile } from "solid-js/store"

import { Audio } from "~/audio"
import { Button } from "~/components/button"
import { SpeakerIcon } from "~/components/icons"
import { StateEmitter } from "~/lib/state-emitter"
import { defaultTo, range, sample } from "~/lib/util"
import { generateInitialWorld, seedRandom } from "~/lib/world"
import { ALL_EVOLVERS } from "~/pages/construct/lib"
import { RuleSlider } from "~/pages/construct/rule-slider"
import {
	createWgpuWorldRenderer,
	RULE_LOOKUP_WIDTH,
	RULE_STOP_CAP,
} from "~/renderers/renderer-wgpu-worlds"
import {
	isRuleId,
	RULE_IDS,
	writeWorldRuleStops,
} from "~/renderers/wgpu-rule-payload"

import type { WorldState } from "~/lib/types"
import type { RuleId } from "~/renderers/wgpu-rule-payload"

const size = 440
const cellDim = 1
const genSize = size / cellDim

function toEvolverList(state: State) {
	return Object.entries(state).map(
		([id, { evolverName }]): { id: string; evolverName: string } => {
			return { id, evolverName }
		},
	)
}

function getInitialState(count: number) {
	const state: Record<string, EvolverItem> = {}

	for (const i of range(count)) {
		state[`evolver-${i}`] = {
			evolverName: defaultTo("rule3", sample([...RULE_IDS])),
			position: i / count,
			movable: i !== 0,
		}
	}

	return state
}

type State = ReturnType<typeof getInitialState>

function worldStateGenerator() {
	const firstGen = generateInitialWorld(genSize, genSize, seedRandom)

	return function generateWorldState(state: State) {
		const sorted = Object.values(state).toSorted(
			(a, b) => b.position - a.position,
		)

		return range(genSize).reduce<WorldState>((acc, idx) => {
			const evolverName = sorted.find(({ position }) => {
				return position <= idx / acc.length
			})?.evolverName

			const evolver = evolverName ? ALL_EVOLVERS[evolverName] : undefined

			return evolver?.(acc) ?? acc
		}, firstGen)
	}
}

const whenIdle: NonNullable<typeof globalThis.requestIdleCallback> =
	typeof globalThis.requestIdleCallback === "function"
		? globalThis.requestIdleCallback
		: (fn) => setTimeout(fn, 0)

interface EvolverItem {
	evolverName: RuleId
	position: number
	movable: boolean
}

function flattenWorld(world: WorldState) {
	const cells = new Uint32Array(genSize * genSize)
	let ptr = 0

	for (const generation of world) {
		for (const cell of generation) {
			cells[ptr] = cell
			ptr += 1
		}
	}

	return cells
}

function toRuleStops(state: State) {
	const sorted = Object.values(state).toSorted(
		(a, b) => a.position - b.position,
	)

	return sorted.map((item): readonly [RuleId, number] => {
		return [item.evolverName, Math.min(1, Math.max(0, 1 - item.position))]
	})
}

async function getDevice() {
	const adapter = await navigator.gpu.requestAdapter()

	if (!adapter) throw new Error("No WebGPU adapter available")

	return adapter.requestDevice()
}

export function WgpuConstruct() {
	const audio = new Audio()
	const generateWorldState = worldStateGenerator()
	const state = new StateEmitter(getInitialState(3))
	const [evolvers, setEvolvers] = createStore({
		evolverList: toEvolverList(state.get()),
	})
	const initialCells = flattenWorld(
		generateInitialWorld(genSize, genSize, seedRandom),
	)
	const ruleLookups = new Uint32Array(RULE_STOP_CAP * RULE_LOOKUP_WIDTH)
	const transitionRatios = new Float32Array(RULE_STOP_CAP)
	const ruleCounts = new Uint32Array(1)

	let worldState: ReturnType<typeof generateWorldState> | undefined = undefined
	let worldCanvasEl: HTMLCanvasElement | null = null
	let renderer: ReturnType<typeof createWgpuWorldRenderer> | undefined =
		undefined

	function renderWorld() {
		if (!renderer) return

		ruleLookups.fill(0)
		transitionRatios.fill(0)
		ruleCounts.fill(0)

		writeWorldRuleStops({
			worldIndex: 0,
			stops: toRuleStops(state.get()),
			ruleLookups,
			transitionRatios,
			ruleCounts,
			stopCap: RULE_STOP_CAP,
			lookupWidth: RULE_LOOKUP_WIDTH,
		})

		renderer.seed(initialCells)

		for (let i = 0; i < genSize - 1; i++) {
			renderer.step({
				ruleLookups,
				transitionRatios,
				ruleCounts,
			})
		}

		renderer.renderCurrent()
	}

	const unlistenState = state.listen((current) => {
		setEvolvers("evolverList", reconcile(toEvolverList(current)))

		whenIdle(() => {
			worldState = generateWorldState(current)
			audio.update(worldState)
			requestAnimationFrame(renderWorld)
		})
	})

	onMount(() => {
		if (!worldCanvasEl) return

		void (async () => {
			const device = await getDevice()
			const context = worldCanvasEl.getContext("webgpu")

			if (!context) return

			renderer = createWgpuWorldRenderer(device, context, {
				worldCount: 1,
				generationSize: genSize,
			})

			worldState = generateWorldState(state.get())
			audio.update(worldState)
			renderWorld()
		})()
	})

	onCleanup(async () => {
		unlistenState()
		await audio.dispose()
	})

	return (
		<>
			<div class="flex items-center justify-center block-full inline-full">
				<div
					data-el="world-container"
					class="relative block-[440px] inline-[440px]"
				>
					<div class="absolute inset-0 z-10">
						<For each={evolvers.evolverList}>
							{(item) => (
								<RuleSlider
									evolverName={item.evolverName}
									initialPosition={(state.get()[item.id]?.position ?? 0) * size}
									maxPosition={size}
									movable={!!state.get()[item.id]?.movable}
									onPositionChange={(pos) => {
										state.updateMut((current) => {
											const currentItem = current[item.id]

											if (currentItem) currentItem.position = pos / size
										})
									}}
									onEvolverSelect={(name) => {
										state.updateMut((current) => {
											const currentItem = current[item.id]

											if (currentItem && isRuleId(name)) {
												currentItem.evolverName = name
											}
										})
									}}
								/>
							)}
						</For>
					</div>
					<canvas
						class="absolute inset-0 z-0 bg-transparent"
						ref={(el) => void (worldCanvasEl = el)}
						width={size}
						height={size}
					/>
				</div>
			</div>
			<div class="absolute inset-s-1/2 inset-be-[2em] flex -translate-x-1/2 gap-4">
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
